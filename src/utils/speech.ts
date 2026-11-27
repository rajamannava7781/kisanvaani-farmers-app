import { AnalysisResult, LanguageCode } from '../types';
import { getLanguageOption, TRANSLATIONS } from '../i18n/translations';

const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let sharedAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;
let activeAbortController: AbortController | null = null;
let currentSessionId = 0;
let cloudTtsUnavailable = false;

const ttsAudioUrlCache = new Map<string, string>();

function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
  }
  return sharedAudio;
}

export function unlockAudioPlayback(): void {
  const audio = getSharedAudio();
  if (!audio || audioUnlocked) return;
  try {
    audio.src = SILENT_WAV_DATA_URI;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          if (audio.src === SILENT_WAV_DATA_URI) {
            audio.pause();
            audio.currentTime = 0;
          }
          audioUnlocked = true;
        })
        .catch(() => {
          // Ignore unlock failures outside direct user gestures
        });
    }
  } catch {
    // Ignore
  }
}

function pickExactLanguageVoice(
  voices: SpeechSynthesisVoice[],
  targetLang: string
): SpeechSynthesisVoice | undefined {
  if (!voices.length) return undefined;
  const exact = voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase());
  if (exact) return exact;

  const langPrefix = targetLang.split('-')[0].toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
}

function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }
  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    setTimeout(finish, 250);
  });
}

function base64ToWavUrl(base64: string, mimeType = 'audio/wav'): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function stopSpeaking(): void {
  currentSessionId += 1;

  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }

  if (sharedAudio) {
    try {
      sharedAudio.onended = null;
      sharedAudio.onerror = null;
      sharedAudio.pause();
      sharedAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
}

function speakWithBrowser(
  text: string,
  language: LanguageCode,
  voices: SpeechSynthesisVoice[],
  sessionId: number,
  callbacks?: { onStart?: () => void; onEnd?: () => void }
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  const langOpt = getLanguageOption(language);
  const matchedVoice = pickExactLanguageVoice(voices, langOpt.speechLang);

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    // Preserve the target language tag so regional TTS engines route properly
    utterance.lang = matchedVoice ? matchedVoice.lang : langOpt.speechLang;
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (sessionId === currentSessionId) callbacks?.onStart?.();
    };
    utterance.onend = () => {
      if (sessionId === currentSessionId) callbacks?.onEnd?.();
    };
    utterance.onerror = () => {
      if (sessionId === currentSessionId) callbacks?.onEnd?.();
    };

    callbacks?.onStart?.();
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function buildFullResultNarration(
  result: AnalysisResult,
  language: LanguageCode
): string {
  const t = TRANSLATIONS[language];
  const parts: string[] = [];

  const severityLabel =
    result.severity === 'green'
      ? t.severityGreen
      : result.severity === 'amber'
      ? t.severityAmber
      : t.severityRed;

  parts.push(`${severityLabel}. ${result.title}.`);

  if (result.spokenSummary) {
    parts.push(result.spokenSummary);
  }

  if (result.category === 'packet' && result.packetDetails) {
    const p = result.packetDetails;
    if (p.whatItIsFor) parts.push(`${t.packetWhatFor}: ${p.whatItIsFor}.`);
    if (p.dosagePerLitre) parts.push(`${t.packetDosageLitre}: ${p.dosagePerLitre}.`);
    if (p.dosagePerAcre) parts.push(`${t.packetDosageAcre}: ${p.dosagePerAcre}.`);
    if (p.whenToSprayAndSafety) parts.push(`${t.packetSpraySafety}: ${p.whenToSprayAndSafety}.`);
    if (p.waitingPeriodBeforeHarvest) parts.push(`${t.packetHarvestWait}: ${p.waitingPeriodBeforeHarvest}.`);
    if (p.banOrMixWarning) parts.push(`${t.packetWarning}: ${p.banOrMixWarning}.`);
  }

  if ((result.category === 'plant' || result.category === 'general') && result.plantDetails) {
    const pl = result.plantDetails;
    if (pl.likelyCause) parts.push(`${t.plantCause}: ${pl.likelyCause}.`);
    if (pl.tier1Organic) parts.push(`${t.tier1Label}: ${pl.tier1Organic}.`);
    if (pl.tier2Cultural) parts.push(`${t.tier2Label}: ${pl.tier2Cultural}.`);
    if (pl.tier3Chemical) parts.push(`${t.tier3Label}: ${pl.tier3Chemical}.`);
    const followUps = pl.followUpQuestions?.slice(0, 2) || [];
    if (followUps.length > 0) {
      parts.push(`${t.plantQuestionsTitle} ${followUps.join(' ')}`);
    }
  }

  if (result.severity === 'amber' || result.severity === 'red' || result.officerNote) {
    parts.push(result.officerNote || t.officerDefault);
  }

  return parts.join(' ');
}

export async function speakText(
  text: string,
  language: LanguageCode,
  callbacks?: { onStart?: () => void; onEnd?: () => void }
): Promise<void> {
  const cleanText = text.trim();
  if (typeof window === 'undefined' || !cleanText) {
    callbacks?.onEnd?.();
    return;
  }

  stopSpeaking();
  const sessionId = currentSessionId;
  unlockAudioPlayback();

  const langOpt = getLanguageOption(language);
  const voices = await getAvailableVoices();
  if (sessionId !== currentSessionId) return;

  const nativeVoice = pickExactLanguageVoice(voices, langOpt.speechLang);

  // 1. Prefer native device/browser voice if available for this exact language (instant, zero API quota)
  if (nativeVoice) {
    const started = speakWithBrowser(cleanText, language, voices, sessionId, callbacks);
    if (started) return;
  }

  const cacheKey = `${language}|${cleanText}`;
  const playAudioUrl = (audioUrl: string): Promise<boolean> =>
    new Promise((resolve) => {
      if (sessionId !== currentSessionId) {
        resolve(false);
        return;
      }
      const audio = getSharedAudio();
      if (!audio) {
        resolve(false);
        return;
      }

      audio.onended = () => {
        if (sessionId === currentSessionId) callbacks?.onEnd?.();
        resolve(true);
      };
      audio.onerror = () => {
        resolve(false);
      };

      audio.src = audioUrl;
      callbacks?.onStart?.();
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          resolve(false);
        });
      }
    });

  // 2. Play immediately if cached from earlier cloud TTS call
  const cachedUrl = ttsAudioUrlCache.get(cacheKey);
  if (cachedUrl) {
    const ok = await playAudioUrl(cachedUrl);
    if (ok || sessionId !== currentSessionId) return;
  }

  // 3. Try cloud Gemini TTS only if not already in quota cooldown
  if (!cloudTtsUnavailable) {
    try {
      callbacks?.onStart?.();
      const controller = new AbortController();
      activeAbortController = controller;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, language }),
        signal: controller.signal,
      });

      if (sessionId !== currentSessionId) return;

      if (response.ok) {
        const data = (await response.json()) as {
          audioBase64?: string | null;
          mimeType?: string;
          useBrowserFallback?: boolean;
        };

        if (data.audioBase64) {
          const url = base64ToWavUrl(data.audioBase64, data.mimeType || 'audio/wav');
          ttsAudioUrlCache.set(cacheKey, url);
          const played = await playAudioUrl(url);
          if (played || sessionId !== currentSessionId) return;
        } else if (data.useBrowserFallback) {
          cloudTtsUnavailable = true;
        }
      }
    } catch {
      if (sessionId !== currentSessionId) return;
    } finally {
      activeAbortController = null;
    }
  }

  // 4. Final fallback: invoke browser speechSynthesis preserving target lang tag (te-IN / ta-IN / hi-IN / en-IN)
  const fallbackStarted = speakWithBrowser(cleanText, language, voices, sessionId, callbacks);
  if (!fallbackStarted && sessionId === currentSessionId) {
    callbacks?.onEnd?.();
  }
}

export function compressImageFile(file: File, maxDimension = 1024, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function createThumbnailDataUrl(dataUrl: string, maxDimension = 160): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve('');
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.src = dataUrl;
  });
}
