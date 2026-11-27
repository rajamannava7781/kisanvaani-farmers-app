import React from 'react';
import { Volume2, Square } from 'lucide-react';

interface AudioWaveformBannerProps {
  message: string;
  isSpeaking: boolean;
  replayLabel: string;
  stopLabel: string;
  onReplay: () => void;
  onStop: () => void;
}

const BAR_DELAYS = ['0ms', '140ms', '280ms', '90ms', '220ms', '340ms', '120ms'];

export const AudioWaveformBanner: React.FC<AudioWaveformBannerProps> = ({
  message,
  isSpeaking,
  replayLabel,
  stopLabel,
  onReplay,
  onStop,
}) => {
  return (
    <section
      aria-label="Spoken voice prompt"
      className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xl font-extrabold leading-snug text-[#142316]">
          {message}
        </p>
        <div
          className="flex items-end gap-1 h-8 shrink-0 px-2 py-1 rounded-xl bg-[#EEF3EA]"
          aria-hidden="true"
        >
          {BAR_DELAYS.map((delay, i) => (
            <span
              key={i}
              style={{
                animationDelay: isSpeaking ? delay : '0ms',
              }}
              className={`w-1.5 rounded-full ${
                isSpeaking
                  ? 'h-6 bg-[#F59E0B] wave-bar'
                  : 'h-2.5 bg-[#1B5E20]/40'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isSpeaking ? (
          <button
            type="button"
            onClick={onStop}
            className="min-h-[52px] flex-1 rounded-2xl bg-[#EF4444] text-white font-extrabold text-base px-4 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
          >
            <Square className="w-5 h-5 fill-current" />
            <span className="whitespace-nowrap">{stopLabel}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onReplay}
            className="min-h-[52px] flex-1 rounded-2xl bg-[#1B5E20] text-white font-extrabold text-base px-4 flex items-center justify-center gap-2 shadow-sm hover:bg-[#154A19] active:scale-[0.98] transition-transform"
          >
            <Volume2 className="w-6 h-6 text-[#F59E0B]" />
            <span className="whitespace-nowrap">{replayLabel}</span>
          </button>
        )}
      </div>
    </section>
  );
};
