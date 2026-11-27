import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { LiveServerMessage } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ttsAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1beta',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const LANGUAGE_MAP: Record<string, string> = {
  te: 'Telugu (simple, everyday rural spoken Telugu script)',
  hi: 'Hindi (simple, everyday rural spoken Hindi Devanagari script)',
  ta: 'Tamil (simple, everyday rural spoken Tamil script)',
  en: 'Simple Indian English (very short, plain words)',
};

const OFFICER_NOTES: Record<string, string> = {
  te: 'దయచేసి మీ స్థానిక వ్యవసాయ అధికారితో నిర్ధారించుకోండి.',
  hi: 'कृपया अपने स्थानीय कृषि अधिकारी से पुष्टि जरूर करें।',
  ta: 'தயவுசெய்து உங்கள் உள்ளூர் வேளாண் அதிகாரியிடம் உறுதிப்படுத்தவும்.',
  en: 'Please confirm with your local agriculture officer.',
};

interface AnalyzeBody {
  imageBase64?: string;
  mimeType?: string;
  question?: string;
  language?: string;
  followUpContext?: string;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: 'Classify input as "packet" (pesticide/fertilizer bottle/bag/label), "plant" (sick leaf, stem, pest, or crop issue), or "general" (voice/text question without packet/plant photo).',
    },
    title: {
      type: Type.STRING,
      description: 'Short clear title (2 to 5 words) in the requested farmer language.',
    },
    severity: {
      type: Type.STRING,
      description: 'Traffic-light urgency: "green" (Safe/Healthy or organic), "amber" (Watch / standard chemical gear needed), or "red" (Act Now / severe disease / banned or highly toxic chemical).',
    },
    spokenSummary: {
      type: Type.STRING,
      description: 'Simple, warm spoken answer in the requested language. Maximum 3 short sentences suitable for reading aloud to a farmer with limited literacy.',
    },
    packetDetails: {
      type: Type.OBJECT,
      description: 'Required when category is "packet".',
      properties: {
        whatItIsFor: {
          type: Type.STRING,
          description: 'What pest, disease, or crop nutrient this packet is for, in simple words.',
        },
        dosagePerLitre: {
          type: Type.STRING,
          description: 'Exact dosage per 1 litre of water (e.g., "2 ml per 1 Litre").',
        },
        dosagePerAcre: {
          type: Type.STRING,
          description: 'Exact dosage per 1 acre (e.g., "400 ml per 1 Acre").',
        },
        numericDosagePerLitre: {
          type: Type.NUMBER,
          description: 'Numeric ml or grams per 1 litre of water for tank calculator (e.g., 2.0). Use 0 if not specified.',
        },
        dosageUnit: {
          type: Type.STRING,
          description: '"ml" for liquids or "g" for powders/granules.',
        },
        whenToSprayAndSafety: {
          type: Type.STRING,
          description: 'Best time to spray (morning/evening) and required safety gear (mask, gloves, wash hands).',
        },
        waitingPeriodBeforeHarvest: {
          type: Type.STRING,
          description: 'Safe waiting days before harvest (PHI) in simple words.',
        },
        isBannedOrUnsafe: {
          type: Type.BOOLEAN,
          description: 'True if banned/restricted in India (e.g. Monocrotophos on vegetables, Endosulfan, Phorate, Carbofuran restrictions) or unsafe to mix.',
        },
        banOrMixWarning: {
          type: Type.STRING,
          description: 'Clear red warning if banned/restricted or unsafe to mix, or a short safe-mixing reminder.',
        },
      },
    },
    plantDetails: {
      type: Type.OBJECT,
      description: 'Required when category is "plant" or "general" crop advisory.',
      properties: {
        likelyCause: {
          type: Type.STRING,
          description: 'Likely disease, pest, or nutrient issue in simple everyday language.',
        },
        followUpQuestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Exactly 2 very short simple follow-up questions like "When did spots start?" and "Did it rain recently?" in the requested language.',
        },
        tier1Organic: {
          type: Type.STRING,
          description: 'Organic remedy first. STRICTLY MAX 5 WORDS in requested language.',
        },
        tier2Cultural: {
          type: Type.STRING,
          description: 'Cultural / farm care fix second. STRICTLY MAX 5 WORDS in requested language.',
        },
        tier3Chemical: {
          type: Type.STRING,
          description: 'Chemical option last. STRICTLY MAX 5 WORDS in requested language.',
        },
      },
    },
    officerNote: {
      type: Type.STRING,
      description: 'Mandatory officer confirmation sentence in the requested language whenever severity is amber or red.',
    },
  },
  required: ['category', 'title', 'severity', 'spokenSummary'],
};

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as AnalyzeBody;
      const langCode = body.language && LANGUAGE_MAP[body.language] ? body.language : 'en';
      const targetLanguage = LANGUAGE_MAP[langCode];
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      const followUpContext = typeof body.followUpContext === 'string' ? body.followUpContext.trim() : '';
      const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
      const mimeType = typeof body.mimeType === 'string' && body.mimeType.startsWith('image/')
        ? body.mimeType
        : 'image/jpeg';

      if (!imageBase64 && !question) {
        res.status(400).json({ error: 'Please provide a photo or a question.' });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
        return;
      }

      const systemInstruction = [
        'You are KisanVaani, a helpful, trustworthy agricultural assistant for small and marginal farmers in India (ages 30-60, limited literacy).',
        `Always respond strictly in ${targetLanguage}.`,
        'Use warm, simple, everyday village-level words. Never use complex scientific jargon.',
        'Keep spokenSummary to at most 3 short, clear sentences so it sounds natural when read aloud.',
        'If the image shows a PESTICIDE, FUNGICIDE, HERBICIDE, or FERTILIZER PACKET/BOTTLE:',
        '  - Set category to "packet".',
        '  - Fill packetDetails with: 1) whatItIsFor, 2) dosagePerLitre and dosagePerAcre (plus numericDosagePerLitre and dosageUnit), 3) whenToSprayAndSafety (evening/morning + mask/gloves), 4) waitingPeriodBeforeHarvest, 5) isBannedOrUnsafe & banOrMixWarning (flag if banned/restricted in India or unsafe to mix with alkaline/other chemicals).',
        '  - If banned or red-triangle highly hazardous, set severity to "red". Otherwise "amber" for standard chemicals or "green" for safe organic inputs.',
        'If the image shows a SICK LEAF, STEM, PEST, or CROP, or the farmer asks about a crop problem:',
        '  - Set category to "plant" (or "general" for non-crop questions).',
        '  - Set traffic-light severity: "green" (healthy/safe), "amber" (watch closely), "red" (act now / spreading fast).',
        '  - Fill plantDetails: likelyCause, 2 very short followUpQuestions (like "When did spots start?" and "Did it rain recently?"), and strictly 3 tiered solutions:',
        '    * tier1Organic: Organic remedy first — STRICTLY 5 WORDS OR LESS.',
        '    * tier2Cultural: Cultural farm fix second — STRICTLY 5 WORDS OR LESS.',
        '    * tier3Chemical: Chemical option last — STRICTLY 5 WORDS OR LESS.',
        `Whenever severity is "amber" or "red", set officerNote to exact sentence: "${OFFICER_NOTES[langCode]}"`,
      ].join('\n');

      const promptLines: string[] = [];
      if (imageBase64 && question) {
        promptLines.push(`Farmer photo attached. Farmer asks: "${question}"`);
      } else if (imageBase64) {
        promptLines.push('Analyze this photo for the farmer. Identify whether it is an agrochemical/fertilizer packet or a plant/crop leaf/stem.');
      } else {
        promptLines.push(`Farmer asks: "${question}"`);
      }

      if (followUpContext) {
        promptLines.push(`Additional farmer answers to follow-up questions: ${followUpContext}`);
      }

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (imageBase64) {
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });
      }
      parts.push({ text: promptLines.join('\n') });

      const candidateModels = ['gemini-4-hydrogen', 'gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
      let responseText: string | undefined;

      for (let attempt = 0; attempt < candidateModels.length; attempt++) {
        const modelName = candidateModels[attempt];
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
            },
          });
          responseText = response.text;
          break;
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const isTransient =
            errMsg.includes('503') ||
            errMsg.includes('UNAVAILABLE') ||
            errMsg.includes('429') ||
            errMsg.includes('RESOURCE_EXHAUSTED') ||
            errMsg.toLowerCase().includes('high demand');

          if (!isTransient || attempt === candidateModels.length - 1) {
            throw err;
          }
          const delayMs = attempt === 0 ? 600 : 350;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      const rawText = (responseText ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      // Ensure officer note is always present for amber/red severity
      if ((parsed.severity === 'amber' || parsed.severity === 'red') && !parsed.officerNote) {
        parsed.officerNote = OFFICER_NOTES[langCode];
      }

      res.json(parsed);
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'Failed to analyze request';
      console.error('Analyze error:', rawMessage);

      const body = (req.body || {}) as AnalyzeBody;
      const lang = body.language && LANGUAGE_MAP[body.language] ? body.language : 'en';
      const busyMessages: Record<string, string> = {
        te: 'ప్రస్తుతం సర్వర్ చాలా బిజీగా ఉంది. దయచేసి కొన్ని క్షణాల తర్వాత మళ్లీ ప్రయత్నించండి.',
        hi: 'अभी सेवा पर अधिक लोड है। कृपया कुछ सेकंड बाद फिर कोशिश करें।',
        ta: 'தற்போது சேவை மிகவும் பிஸியாக உள்ளது. தயவுசெய்து சில வினாடிகளுக்குப் பிறகு மீண்டும் முயற்சிக்கவும்.',
        en: 'The service is experiencing temporary high demand. Please tap Try Again in a few seconds.',
      };

      const isTemporaryBusy =
        rawMessage.includes('503') ||
        rawMessage.includes('UNAVAILABLE') ||
        rawMessage.toLowerCase().includes('high demand');

      res.status(isTemporaryBusy ? 503 : 500).json({
        error: isTemporaryBusy ? busyMessages[lang] : rawMessage,
      });
    }
  });

  const ttsCache = new Map<string, string>();
  let ttsQuotaCooldownUntil = 0;

  function pcm24kToWavBase64(pcmChunks: Buffer[]): string {
    const pcmData = Buffer.concat(pcmChunks);
    const header = Buffer.alloc(44);
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + pcmData.length, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(pcmData.length, 40);

    return Buffer.concat([header, pcmData]).toString('base64');
  }

  async function synthesizeSpeechViaLive(text: string, langCode: string): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY) return null;
    const targetLanguage = LANGUAGE_MAP[langCode] || LANGUAGE_MAP.en;

    return new Promise((resolve) => {
      const pcmChunks: Buffer[] = [];
      let finished = false;
      let sessionRef: { close: () => void; sendRealtimeInput: (input: { text: string }) => void } | null = null;

      const finish = (result: string | null) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        if (sessionRef) {
          try {
            sessionRef.close();
          } catch {
            // Ignore close errors
          }
        }
        resolve(result);
      };

      const timeout = setTimeout(() => {
        finish(pcmChunks.length > 0 ? pcm24kToWavBase64(pcmChunks) : null);
      }, 25000);

      ttsAi.live
        .connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
            systemInstruction: `You are a clear voice narrator for Indian farmers. Read the exact message given to you aloud verbatim in ${targetLanguage}, slowly and warmly, without adding extra words.`,
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              const content = message.serverContent;
              for (const part of content?.modelTurn?.parts ?? []) {
                if (part.inlineData?.data) {
                  pcmChunks.push(Buffer.from(part.inlineData.data, 'base64'));
                }
              }
              if (content?.turnComplete) {
                finish(pcmChunks.length > 0 ? pcm24kToWavBase64(pcmChunks) : null);
              }
            },
            onerror: () => finish(null),
            onclose: () => finish(pcmChunks.length > 0 ? pcm24kToWavBase64(pcmChunks) : null),
          },
        })
        .then((session) => {
          if (finished) {
            try {
              session.close();
            } catch {
              // Ignore
            }
            return;
          }
          sessionRef = session;
          session.sendRealtimeInput({ text });
        })
        .catch(() => finish(null));
    });
  }

  app.post('/api/tts', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as { text?: string; language?: string };
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      const langCode = body.language && LANGUAGE_MAP[body.language] ? body.language : 'en';

      if (!text) {
        res.status(400).json({ error: 'Text is required for speech generation.' });
        return;
      }

      const cacheKey = `${langCode}|${text}`;
      const cached = ttsCache.get(cacheKey);
      if (cached) {
        res.json({ audioBase64: cached, mimeType: 'audio/wav' });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        res.json({ audioBase64: null, useBrowserFallback: true, reason: 'missing_key' });
        return;
      }

      let base64Audio: string | null = null;

      if (Date.now() >= ttsQuotaCooldownUntil) {
        try {
          const styleByLang: Record<string, string> = {
            te: 'Warm, clear, respectful rural Telugu agricultural advisor speaking slowly and naturally in Telugu',
            hi: 'Warm, clear, respectful rural Hindi agricultural advisor speaking slowly and naturally in Hindi',
            ta: 'Warm, clear, respectful rural Tamil agricultural advisor speaking slowly and naturally in Tamil',
            en: 'Warm, clear, respectful Indian agricultural advisor speaking slowly and simply in Indian English',
          };

          const response = await ttsAi.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text,
                    speechMetadata: {
                      style: styleByLang[langCode] || styleByLang.en,
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            },
          });

          base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
        } catch (ttsErr) {
          const msg = ttsErr instanceof Error ? ttsErr.message : String(ttsErr);
          if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
            ttsQuotaCooldownUntil = Date.now() + 10 * 60 * 1000;
          }
        }
      }

      // Fallback to gemini-3.8-live audio synthesis when TTS model hits free-tier 429 limit
      if (!base64Audio) {
        base64Audio = await synthesizeSpeechViaLive(text, langCode);
      }

      if (!base64Audio) {
        res.json({ audioBase64: null, useBrowserFallback: true, reason: 'tts_unavailable' });
        return;
      }

      if (ttsCache.size >= 60) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, base64Audio);

      res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate speech';
      console.warn('TTS fallback triggered:', message);
      res.json({ audioBase64: null, useBrowserFallback: true, reason: 'tts_unavailable' });
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const disableHmr = process.env.DISABLE_HMR === 'true';
    let clientWsDisabled = disableHmr;
    const vite = await createViteServer({
      plugins: [
        {
          name: 'disable-vite-client-ws-when-hmr-off',
          enforce: 'post',
          configResolved(resolvedConfig) {
            clientWsDisabled =
              disableHmr ||
              resolvedConfig.server.hmr === false ||
              resolvedConfig.server.ws === false;
          },
          transform(code, id) {
            if (!clientWsDisabled) return;
            if (id.includes('/vite/dist/client/client.mjs')) {
              const startMarker = 'const transport = normalizeModuleRunnerTransport(';
              const endMarker = 'let willUnload = false;';
              const startIdx = code.indexOf(startMarker);
              const endIdx = code.indexOf(endMarker, startIdx);
              if (startIdx !== -1 && endIdx !== -1) {
                return {
                  code:
                    code.slice(0, startIdx) +
                    'const transport = normalizeModuleRunnerTransport({ connect() {}, disconnect() {}, send() {} });\n' +
                    code.slice(endIdx),
                  map: null,
                };
              }
            }
          },
        },
      ],
      server: {
        middlewareMode: true,
        hmr: !disableHmr,
        ws: disableHmr ? false : { server: httpServer },
        watch: disableHmr ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  const liveWss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    try {
      const host = request.headers.host || 'localhost:3000';
      const reqUrl = new URL(request.url || '/', `http://${host}`);
      if (reqUrl.pathname === '/api/live') {
        liveWss.handleUpgrade(request, socket, head, (ws) => {
          liveWss.emit('connection', ws, request);
        });
      }
    } catch {
      socket.destroy();
    }
  });

  liveWss.on('connection', (clientWs: WebSocket, request) => {
    const host = request.headers.host || 'localhost:3000';
    const reqUrl = new URL(request.url || '/', `http://${host}`);
    const langParam = reqUrl.searchParams.get('lang') || 'en';
    const langCode = LANGUAGE_MAP[langParam] ? langParam : 'en';
    const targetLanguage = LANGUAGE_MAP[langCode];

    if (!process.env.GEMINI_API_KEY) {
      clientWs.send(JSON.stringify({ error: 'Gemini API key is not configured on the server.' }));
      clientWs.close();
      return;
    }

    const liveSystemInstruction = [
      'You are KisanVaani, a warm, trustworthy voice agricultural advisor for small and marginal farmers in India.',
      `Speak ONLY in ${targetLanguage}. Use simple, everyday village-level words.`,
      'Keep every spoken reply short (2 to 3 simple sentences) so farmers can easily follow by listening.',
      'When a farmer describes a crop, leaf, pest, or spray problem:',
      '1) Acknowledge warmly and name the likely cause simply.',
      '2) Ask 1 quick helpful follow-up question (like when it started or recent rain) if helpful.',
      '3) Give practical 3-step advice: organic remedy first, farm care second, chemical option last.',
      '4) If they mention a pesticide or fertilizer, state dosage per litre/acre, safety gear, and harvest waiting days.',
      `For any serious crop disease or chemical spraying, end with: "${OFFICER_NOTES[langCode]}"`,
    ].join('\n');

    let isClosed = false;

    const sessionPromise = ttsAi.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: liveSystemInstruction,
      },
      callbacks: {
        onopen: () => {
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ ready: true }));
          }
        },
        onmessage: (message: LiveServerMessage) => {
          if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            clientWs.send(
              JSON.stringify({ inputTranscript: content.inputTranscription.text })
            );
          }
          if (content?.outputTranscription?.text) {
            clientWs.send(
              JSON.stringify({ outputTranscript: content.outputTranscription.text })
            );
          }
          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
            }
          }
          if (content?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
          if (content?.turnComplete) {
            clientWs.send(JSON.stringify({ turnComplete: true }));
          }
        },
        onerror: (err: unknown) => {
          if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;
          const msg = err instanceof Error ? err.message : 'Live voice connection error';
          clientWs.send(JSON.stringify({ error: msg }));
        },
        onclose: () => {
          if (!isClosed && clientWs.readyState === WebSocket.OPEN) {
            clientWs.close();
          }
        },
      },
    });

    sessionPromise.catch((err: unknown) => {
      if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;
      const msg = err instanceof Error ? err.message : 'Could not start live voice session';
      clientWs.send(JSON.stringify({ error: msg }));
      clientWs.close();
    });

    clientWs.on('message', (raw) => {
      let payload: { audio?: string; text?: string; video?: string };
      try {
        payload = JSON.parse(raw.toString()) as { audio?: string; text?: string; video?: string };
      } catch {
        return;
      }

      sessionPromise
        .then((session) => {
          if (isClosed) return;
          if (payload.audio) {
            session.sendRealtimeInput({
              audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (payload.video) {
            const cleanBase64 = payload.video.includes(',')
              ? payload.video.split(',')[1]
              : payload.video;
            session.sendRealtimeInput({
              video: { data: cleanBase64, mimeType: 'image/jpeg' },
            });
          } else if (payload.text && payload.text.trim()) {
            session.sendRealtimeInput({
              text: payload.text.trim(),
            });
          }
        })
        .catch(() => {
          // Ignore send errors if session failed to connect
        });
    });

    clientWs.on('close', () => {
      isClosed = true;
      sessionPromise
        .then((session) => {
          try {
            session.close();
          } catch {
            // Ignore close errors
          }
        })
        .catch(() => {
          // Ignore
        });
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`KisanVaani server running on http://0.0.0.0:${PORT}`);
  });
}

createServer();
