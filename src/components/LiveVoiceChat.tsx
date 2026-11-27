import React, { useEffect, useRef, useState } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Camera,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { compressImageFile } from '../utils/speech';
import { FarmerMascotIcon } from './Icons';

interface TranscriptMessage {
  id: string;
  role: 'farmer' | 'assistant' | 'system';
  text: string;
}

interface LiveVoiceChatProps {
  language: LanguageCode;
  onClose: () => void;
}

const WAVE_DELAYS = ['0ms', '120ms', '240ms', '80ms', '200ms', '300ms'];

function resampleFloat32To16k(input: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) return input;
  const ratio = inputSampleRate / 16000;
  const newLength = Math.max(1, Math.round(input.length / ratio));
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const low = Math.floor(srcIndex);
    const high = Math.min(low + 1, input.length - 1);
    const frac = srcIndex - low;
    result[i] = input[low] * (1 - frac) + input[high] * frac;
  }
  return result;
}

function float32ToPcm16Base64(float32: Float32Array): string {
  const pcm16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const byteLen = binary.length;
  const bytes = new Uint8Array(byteLen);
  for (let i = 0; i < byteLen; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const sampleCount = Math.floor(byteLen / 2);
  const view = new DataView(bytes.buffer);
  const float32 = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    const int16 = view.getInt16(i * 2, true);
    float32[i] = int16 / 32768;
  }
  return float32;
}

export const LiveVoiceChat: React.FC<LiveVoiceChatProps> = ({ language, onClose }) => {
  const t = TRANSLATIONS[language];

  const [status, setStatus] = useState<'connecting' | 'ready' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [micWarning, setMicWarning] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: t.liveWelcomeHint,
    },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const isMutedRef = useRef<boolean>(false);
  const isReadyRef = useRef<boolean>(false);
  const isClosedRef = useRef<boolean>(false);

  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopAllPlayback = () => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Ignore already stopped sources
      }
    }
    activeSourcesRef.current.clear();
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
    setIsModelSpeaking(false);
  };

  const appendTranscript = (role: 'farmer' | 'assistant' | 'system', chunkText: string) => {
    const clean = chunkText;
    if (!clean) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role && last.id !== 'welcome') {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          text: `${last.text}${last.text.endsWith(' ') || clean.startsWith(' ') ? '' : ' '}${clean}`.trim(),
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          role,
          text: clean.trim(),
        },
      ];
    });
  };

  useEffect(() => {
    isClosedRef.current = false;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live?lang=${encodeURIComponent(language)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const outputCtx = new AudioContext({ sampleRate: 24000 });
    outputAudioCtxRef.current = outputCtx;
    nextStartTimeRef.current = outputCtx.currentTime;

    const schedulePcmChunk = (base64Audio: string) => {
      const ctx = outputAudioCtxRef.current;
      if (!ctx || isClosedRef.current) return;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const samples = base64Pcm16ToFloat32(base64Audio);
      if (samples.length === 0) return;

      const audioBuffer = ctx.createBuffer(1, samples.length, 24000);
      audioBuffer.getChannelData(0).set(samples);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const startAt = Math.max(now, nextStartTimeRef.current);
      nextStartTimeRef.current = startAt + audioBuffer.duration;

      activeSourcesRef.current.add(source);
      setIsModelSpeaking(true);

      source.onended = () => {
        activeSourcesRef.current.delete(source);
        if (activeSourcesRef.current.size === 0 && !isClosedRef.current) {
          setIsModelSpeaking(false);
        }
      };

      source.start(startAt);
    };

    const startMicrophoneCapture = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setMicWarning(t.liveMicDenied);
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        if (isClosedRef.current) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }

        mediaStreamRef.current = stream;
        const inputCtx = new AudioContext({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputCtx;
        if (inputCtx.state === 'suspended') {
          await inputCtx.resume();
        }

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          if (
            isClosedRef.current ||
            isMutedRef.current ||
            !isReadyRef.current ||
            !wsRef.current ||
            wsRef.current.readyState !== WebSocket.OPEN
          ) {
            return;
          }

          const rawChannel = event.inputBuffer.getChannelData(0);
          const pcm16k = resampleFloat32To16k(rawChannel, inputCtx.sampleRate);
          const base64Audio = float32ToPcm16Base64(pcm16k);
          wsRef.current.send(JSON.stringify({ audio: base64Audio }));
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      } catch {
        setMicWarning(t.liveMicDenied);
      }
    };

    ws.onmessage = (event) => {
      if (isClosedRef.current) return;
      try {
        const msg = JSON.parse(event.data as string) as {
          ready?: boolean;
          audio?: string;
          inputTranscript?: string;
          outputTranscript?: string;
          interrupted?: boolean;
          turnComplete?: boolean;
          error?: string;
        };

        if (msg.ready) {
          isReadyRef.current = true;
          setStatus('ready');
          void startMicrophoneCapture();
        }
        if (msg.audio) {
          schedulePcmChunk(msg.audio);
        }
        if (msg.inputTranscript) {
          appendTranscript('farmer', msg.inputTranscript);
        }
        if (msg.outputTranscript) {
          appendTranscript('assistant', msg.outputTranscript);
        }
        if (msg.interrupted) {
          stopAllPlayback();
        }
        if (msg.error) {
          setStatus('error');
          setErrorMessage(msg.error);
        }
      } catch {
        // Ignore malformed server packets
      }
    };

    ws.onerror = () => {
      if (!isClosedRef.current) {
        setStatus('error');
        setErrorMessage('Could not connect to live voice server.');
      }
    };

    ws.onclose = () => {
      isReadyRef.current = false;
    };

    return () => {
      isClosedRef.current = true;
      isReadyRef.current = false;
      stopAllPlayback();

      if (processorRef.current) {
        try {
          processorRef.current.disconnect();
        } catch {
          // Ignore
        }
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((tr) => tr.stop());
      }
      if (inputAudioCtxRef.current) {
        void inputAudioCtxRef.current.close().catch(() => {});
      }
      if (outputAudioCtxRef.current) {
        void outputAudioCtxRef.current.close().catch(() => {});
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [language, t.liveMicDenied]);

  const handleToggleMute = () => {
    const next = !isMuted;
    isMutedRef.current = next;
    setIsMuted(next);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = textInput.trim();
    if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (outputAudioCtxRef.current?.state === 'suspended') {
      void outputAudioCtxRef.current.resume();
    }
    wsRef.current.send(JSON.stringify({ text: trimmed }));
    appendTranscript('farmer', trimmed);
    setTextInput('');
  };

  const handleSendPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    try {
      const compressed = await compressImageFile(file, 768, 0.78);
      wsRef.current.send(JSON.stringify({ video: compressed }));
      appendTranscript('system', t.livePhotoSent);
    } catch {
      // Ignore image errors
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Live Status Banner */}
      <div className="rounded-3xl bg-[#1B5E20] text-white p-4 shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <FarmerMascotIcon className="w-12 h-12 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold leading-tight truncate">
              {t.liveTitle}
            </h2>
            <p className="text-sm font-bold text-amber-200 mt-0.5">
              {status === 'connecting'
                ? t.liveConnecting
                : isModelSpeaking
                ? t.liveSpeaking
                : isMuted
                ? t.liveMuted
                : t.liveListening}
            </p>
          </div>
        </div>

        <div className="flex items-end gap-1 h-8 px-2 py-1 rounded-xl bg-white/15 shrink-0" aria-hidden="true">
          {status === 'connecting' ? (
            <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
          ) : (
            WAVE_DELAYS.map((delay, i) => (
              <span
                key={i}
                style={{ animationDelay: isModelSpeaking || !isMuted ? delay : '0ms' }}
                className={`w-1.5 rounded-full ${
                  isModelSpeaking
                    ? 'h-6 bg-[#F59E0B] wave-bar'
                    : !isMuted
                    ? 'h-4 bg-[#10B981] wave-bar'
                    : 'h-2 bg-white/40'
                }`}
              />
            ))
          )}
        </div>
      </div>

      {status === 'error' && errorMessage && (
        <div className="rounded-2xl bg-[#FEF2F2] border-2 border-[#EF4444] p-4 flex items-center gap-3 text-[#B91C1C]">
          <AlertCircle className="w-7 h-7 shrink-0" />
          <span className="text-base font-extrabold">{errorMessage}</span>
        </div>
      )}

      {micWarning && (
        <div className="rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B] px-4 py-2.5 text-sm font-bold text-[#92400E]">
          {micWarning}
        </div>
      )}

      {/* Live Conversation Transcript */}
      <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm min-h-[240px] max-h-[340px] overflow-y-auto flex flex-col gap-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl px-4 py-3 text-lg font-bold leading-snug max-w-[90%] ${
              m.role === 'farmer'
                ? 'self-end bg-[#FFFBEB] border border-[#F59E0B] text-[#142316]'
                : m.role === 'system'
                ? 'self-center bg-[#EEF3EA] text-[#1B5E20] text-sm font-extrabold'
                : 'self-start bg-[#ECFDF5] border border-[#10B981]/50 text-[#142316]'
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={scrollAnchorRef} />
      </div>

      {/* Text fallback inside live session */}
      <form
        onSubmit={handleSendText}
        className="rounded-2xl bg-white border-2 border-[#1B5E20]/25 p-2 flex items-center gap-2 shadow-sm"
      >
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t.liveTypePlaceholder}
          className="flex-1 min-h-[50px] px-3 bg-transparent text-lg font-bold text-[#142316] placeholder:text-[#5F7462] focus:outline-none min-w-0"
        />
        <button
          type="submit"
          disabled={!textInput.trim() || status !== 'ready'}
          className="min-h-[50px] min-w-[58px] rounded-xl bg-[#1B5E20] text-white font-extrabold px-4 flex items-center justify-center disabled:opacity-40 active:scale-[0.97]"
          aria-label={t.askButton}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Thumb-Zone Call Controls */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleSendPhoto}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleToggleMute}
          className={`min-h-[68px] rounded-2xl font-extrabold text-lg px-3 flex items-center justify-center gap-2 border-2 shadow-sm active:scale-[0.98] transition-transform ${
            isMuted
              ? 'bg-[#F59E0B] text-[#142316] border-[#D97706]'
              : 'bg-white text-[#1B5E20] border-[#1B5E20]/25'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          <span>{isMuted ? t.liveUnmute : t.liveMute}</span>
        </button>

        <button
          type="button"
          disabled={status !== 'ready'}
          onClick={() => photoInputRef.current?.click()}
          className="min-h-[68px] rounded-2xl bg-white text-[#1B5E20] border-2 border-[#1B5E20]/25 font-extrabold text-lg px-3 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          <Camera className="w-6 h-6 text-[#F59E0B]" />
          <span>{t.liveShowPhoto}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="min-h-[68px] w-full rounded-3xl bg-[#EF4444] border-b-[5px] border-[#991B1B] text-white font-extrabold text-xl px-5 flex items-center justify-center gap-2.5 shadow-md active:translate-y-0.5 transition-all"
      >
        <PhoneOff className="w-6 h-6" />
        <span>{t.liveEndCall}</span>
      </button>
    </div>
  );
};
