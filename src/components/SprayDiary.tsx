import React from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Trash2,
  Volume2,
  ShieldCheck,
  AlertTriangle,
  OctagonAlert,
} from 'lucide-react';
import { DiaryEntry, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { buildFullResultNarration } from '../utils/speech';

interface SprayDiaryProps {
  entries: DiaryEntry[];
  language: LanguageCode;
  onSpeakEntry: (text: string) => void;
  onToggleRecovered: (id: string) => void;
  onDeleteEntry: (id: string) => void;
}

export const SprayDiary: React.FC<SprayDiaryProps> = ({
  entries,
  language,
  onSpeakEntry,
  onToggleRecovered,
  onDeleteEntry,
}) => {
  const t = TRANSLATIONS[language];

  const getDaysRemaining = (createdAt: number) => {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - createdAt;
    const remainingMs = sevenDaysMs - elapsed;
    return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-8 text-center flex flex-col items-center gap-3 shadow-sm">
        <CalendarCheck className="w-14 h-14 text-[#1B5E20]/50" />
        <h2 className="text-2xl font-extrabold text-[#142316]">{t.diaryEmpty}</h2>
        <p className="text-base font-medium text-[#4B634E] leading-relaxed">
          {t.diaryEmptySub}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex items-center gap-3">
        <CalendarCheck className="w-9 h-9 text-[#1B5E20] shrink-0" />
        <h2 className="text-2xl font-extrabold text-[#1B5E20]">{t.diaryTitle}</h2>
      </div>

      {entries.map((entry) => {
        const daysLeft = getDaysRemaining(entry.createdAt);
        const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
        });

        const sev = entry.result.severity;
        const SevIcon =
          sev === 'green' ? ShieldCheck : sev === 'amber' ? AlertTriangle : OctagonAlert;
        const sevBg =
          sev === 'green'
            ? 'bg-[#10B981] text-white'
            : sev === 'amber'
            ? 'bg-[#F59E0B] text-[#142316]'
            : 'bg-[#EF4444] text-white';

        return (
          <article
            key={entry.id}
            className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              {entry.thumbnailDataUrl ? (
                <img
                  src={entry.thumbnailDataUrl}
                  alt={entry.result.title}
                  className="w-20 h-20 rounded-2xl object-cover border border-[#1B5E20]/20 shrink-0"
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${sevBg}`}
                >
                  <SevIcon className="w-8 h-8" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold text-[#4B634E]">
                  <span>{dateStr}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {sev === 'green'
                      ? t.severityGreen
                      : sev === 'amber'
                      ? t.severityAmber
                      : t.severityRed}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#142316] leading-snug mt-0.5">
                  {entry.result.title}
                </h3>
              </div>
            </div>

            {/* 7-Day Recovery Reminder Banner */}
            <div
              className={`rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 font-extrabold text-base ${
                entry.checkedRecovered
                  ? 'bg-[#ECFDF5] text-[#047857]'
                  : daysLeft === 0
                  ? 'bg-[#FEF2F2] text-[#B91C1C]'
                  : 'bg-[#FFFBEB] text-[#B45309]'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 shrink-0" />
                <span>
                  {entry.checkedRecovered
                    ? t.diaryRecovered
                    : daysLeft === 0
                    ? t.diaryCheckToday
                    : `${daysLeft} ${t.diaryCheckInDays}`}
                </span>
              </div>
            </div>

            <p className="text-base font-semibold text-[#2E3E30] leading-relaxed">
              {entry.result.spokenSummary}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSpeakEntry(buildFullResultNarration(entry.result, language))}
                className="min-h-[52px] flex-1 rounded-2xl bg-[#1B5E20] text-white font-extrabold text-base px-3 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Volume2 className="w-5 h-5 text-[#F59E0B]" />
                <span>{t.replayAudio}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleRecovered(entry.id)}
                className={`min-h-[52px] rounded-2xl px-3.5 font-extrabold text-sm flex items-center justify-center gap-1.5 border-2 active:scale-[0.98] ${
                  entry.checkedRecovered
                    ? 'bg-[#10B981] text-white border-[#10B981]'
                    : 'bg-[#F9FBF7] text-[#142316] border-[#1B5E20]/25'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.diaryMarkDone}</span>
              </button>

              <button
                type="button"
                aria-label={t.diaryDelete}
                onClick={() => onDeleteEntry(entry.id)}
                className="min-h-[52px] min-w-[52px] rounded-2xl bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center active:scale-[0.95]"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};
