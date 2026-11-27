import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  OctagonAlert,
  Volume2,
  Square,
  Calculator,
  RotateCcw,
  Check,
  UserCheck,
  Clock,
  Droplets,
  Sparkles,
} from 'lucide-react';
import { AnalysisResult, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import {
  OrganicLeafIcon,
  CulturalCareIcon,
  ChemicalSprayerIcon,
  PacketBottleIcon,
} from './Icons';

interface AnalysisResultCardProps {
  result: AnalysisResult;
  language: LanguageCode;
  previewImage?: string;
  isSpeaking: boolean;
  onReplayAudio: () => void;
  onStopAudio: () => void;
  onOpenCalculator: (dosePerLitre: number, unit: 'ml' | 'g') => void;
  onRefineWithFollowUp: (followUpContext: string) => void;
  onReset: () => void;
  isRefining?: boolean;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  result,
  language,
  previewImage,
  isSpeaking,
  onReplayAudio,
  onStopAudio,
  onOpenCalculator,
  onRefineWithFollowUp,
  onReset,
  isRefining = false,
}) => {
  const t = TRANSLATIONS[language];
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const severityStyles = {
    green: {
      bg: 'bg-[#10B981]',
      softBg: 'bg-[#ECFDF5]',
      border: 'border-[#10B981]',
      text: 'text-white',
      label: t.severityGreen,
      Icon: ShieldCheck,
    },
    amber: {
      bg: 'bg-[#F59E0B]',
      softBg: 'bg-[#FFFBEB]',
      border: 'border-[#F59E0B]',
      text: 'text-[#142316]',
      label: t.severityAmber,
      Icon: AlertTriangle,
    },
    red: {
      bg: 'bg-[#EF4444]',
      softBg: 'bg-[#FEF2F2]',
      border: 'border-[#EF4444]',
      text: 'text-white',
      label: t.severityRed,
      Icon: OctagonAlert,
    },
  }[result.severity];

  const SeverityIcon = severityStyles.Icon;
  const followUps = result.plantDetails?.followUpQuestions?.slice(0, 2) || [];

  const handleSelectAnswer = (idx: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [idx]: val }));
  };

  const handleSubmitFollowUp = () => {
    const pairs = followUps
      .map((q, i) => (answers[i] ? `${q} -> ${answers[i]}` : null))
      .filter(Boolean);
    if (pairs.length > 0) {
      onRefineWithFollowUp(pairs.join('; '));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Traffic-Light Severity Banner */}
      <div
        className={`rounded-3xl ${severityStyles.bg} ${severityStyles.text} p-4 shadow-md flex items-center gap-3.5`}
      >
        <div className="w-12 h-12 rounded-2xl bg-black/15 flex items-center justify-center shrink-0">
          <SeverityIcon className="w-7 h-7" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-extrabold uppercase tracking-wide opacity-90">
            {severityStyles.label}
          </span>
          <h2 className="text-2xl font-extrabold leading-tight break-words">
            {result.title}
          </h2>
        </div>
      </div>

      {/* Preview Thumbnail + Spoken Summary + Listen Again */}
      <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex flex-col gap-3.5">
        {previewImage && (
          <img
            src={previewImage}
            alt={result.title}
            className="w-full h-44 object-cover rounded-2xl border border-[#1B5E20]/15"
          />
        )}

        <p className="text-xl font-bold leading-relaxed text-[#142316]">
          {result.spokenSummary}
        </p>

        {isSpeaking ? (
          <button
            type="button"
            onClick={onStopAudio}
            className="min-h-[60px] w-full rounded-2xl bg-[#EF4444] text-white font-extrabold text-lg px-5 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-transform"
          >
            <Square className="w-6 h-6 fill-current" />
            <span>{t.stopAudio}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onReplayAudio}
            className="min-h-[60px] w-full rounded-2xl bg-[#1B5E20] text-white font-extrabold text-lg px-5 flex items-center justify-center gap-2.5 shadow-sm hover:bg-[#154A19] active:scale-[0.98] transition-transform"
          >
            <Volume2 className="w-6 h-6 text-[#F59E0B]" />
            <span>{t.replayAudio}</span>
          </button>
        )}
      </div>

      {/* PACKET ANALYSIS DETAILS */}
      {result.category === 'packet' && result.packetDetails && (
        <div className="flex flex-col gap-3">
          {/* 1. What it is for */}
          <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex items-start gap-3.5">
            <PacketBottleIcon className="w-11 h-11 shrink-0" />
            <div>
              <div className="text-sm font-bold text-[#4B634E]">{t.packetWhatFor}</div>
              <div className="text-lg font-extrabold text-[#142316] mt-0.5">
                {result.packetDetails.whatItIsFor}
              </div>
            </div>
          </div>

          {/* 2. Dosage per Litre & Acre */}
          <div className="rounded-3xl bg-[#FFFBEB] border-2 border-[#F59E0B] p-4 shadow-sm flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-3 border border-[#F59E0B]/40">
                <div className="text-xs font-bold text-[#4B634E] flex items-center gap-1">
                  <Droplets className="w-4 h-4 text-[#1B5E20]" />
                  <span>{t.packetDosageLitre}</span>
                </div>
                <div className="text-lg font-extrabold text-[#142316] mt-1 tabular-nums">
                  {result.packetDetails.dosagePerLitre}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-3 border border-[#F59E0B]/40">
                <div className="text-xs font-bold text-[#4B634E]">
                  {t.packetDosageAcre}
                </div>
                <div className="text-lg font-extrabold text-[#142316] mt-1 tabular-nums">
                  {result.packetDetails.dosagePerAcre}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenCalculator(
                  result.packetDetails?.numericDosagePerLitre || 2,
                  result.packetDetails?.dosageUnit === 'g' ? 'g' : 'ml'
                )
              }
              className="min-h-[58px] w-full rounded-2xl bg-[#F59E0B] text-[#142316] font-extrabold text-lg px-4 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
            >
              <Calculator className="w-6 h-6" />
              <span>{t.openInCalc}</span>
            </button>
          </div>

          {/* 3. When to spray & safety gear */}
          <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm">
            <div className="text-sm font-bold text-[#4B634E]">{t.packetSpraySafety}</div>
            <div className="text-lg font-extrabold text-[#142316] mt-1">
              {result.packetDetails.whenToSprayAndSafety}
            </div>
          </div>

          {/* 4. Waiting period before harvest */}
          <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex items-start gap-3">
            <Clock className="w-7 h-7 text-[#1B5E20] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#4B634E]">{t.packetHarvestWait}</div>
              <div className="text-lg font-extrabold text-[#142316] mt-0.5">
                {result.packetDetails.waitingPeriodBeforeHarvest}
              </div>
            </div>
          </div>

          {/* 5. Ban or mix warning */}
          {result.packetDetails.banOrMixWarning && (
            <div
              className={`rounded-3xl p-4 border-2 shadow-sm flex items-start gap-3 ${
                result.packetDetails.isBannedOrUnsafe
                  ? 'bg-[#EF4444] border-[#B91C1C] text-white'
                  : 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
              }`}
            >
              <OctagonAlert className="w-7 h-7 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-extrabold uppercase tracking-wide">
                  {t.packetWarning}
                </div>
                <div className="text-lg font-extrabold mt-0.5 leading-snug">
                  {result.packetDetails.banOrMixWarning}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SICK PLANT / GENERAL 3-TIER DETAILS */}
      {(result.category === 'plant' || result.category === 'general') && result.plantDetails && (
        <div className="flex flex-col gap-3.5">
          {/* Likely Cause */}
          <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm">
            <div className="text-sm font-bold text-[#4B634E]">{t.plantCause}</div>
            <div className="text-xl font-extrabold text-[#142316] mt-1">
              {result.plantDetails.likelyCause}
            </div>
          </div>

          {/* 3 Strict Tiered Solution Cards */}
          <div className="flex flex-col gap-3">
            {/* Tier 1: Organic First (Green) */}
            <div className="rounded-3xl bg-[#ECFDF5] border-2 border-[#10B981] p-4 shadow-sm flex items-center gap-3.5">
              <OrganicLeafIcon className="w-12 h-12 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-[#047857]">
                  {t.tier1Label}
                </div>
                <div className="text-xl font-extrabold text-[#142316] leading-snug mt-0.5">
                  {result.plantDetails.tier1Organic}
                </div>
              </div>
            </div>

            {/* Tier 2: Cultural Fix Second (Amber) */}
            <div className="rounded-3xl bg-[#FFFBEB] border-2 border-[#F59E0B] p-4 shadow-sm flex items-center gap-3.5">
              <CulturalCareIcon className="w-12 h-12 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-[#B45309]">
                  {t.tier2Label}
                </div>
                <div className="text-xl font-extrabold text-[#142316] leading-snug mt-0.5">
                  {result.plantDetails.tier2Cultural}
                </div>
              </div>
            </div>

            {/* Tier 3: Chemical Option Last (Red) */}
            <div className="rounded-3xl bg-[#FEF2F2] border-2 border-[#EF4444] p-4 shadow-sm flex items-center gap-3.5">
              <ChemicalSprayerIcon className="w-12 h-12 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-[#B91C1C]">
                  {t.tier3Label}
                </div>
                <div className="text-xl font-extrabold text-[#142316] leading-snug mt-0.5">
                  {result.plantDetails.tier3Chemical}
                </div>
              </div>
            </div>
          </div>

          {/* 2 Interactive Follow-up Questions */}
          {followUps.length > 0 && (
            <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex flex-col gap-3.5">
              <div className="text-base font-extrabold text-[#1B5E20] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <span>{t.plantQuestionsTitle}</span>
              </div>

              {followUps.map((q, idx) => {
                const options =
                  idx === 0
                    ? [t.recent, t.older]
                    : [t.yes, t.no];
                return (
                  <div key={idx} className="flex flex-col gap-2">
                    <p className="text-lg font-bold text-[#142316]">{q}</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {options.map((opt) => {
                        const chosen = answers[idx] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectAnswer(idx, opt)}
                            className={`min-h-[52px] rounded-2xl px-3 font-extrabold text-base border-2 flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] ${
                              chosen
                                ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                                : 'bg-[#F9FBF7] text-[#142316] border-[#1B5E20]/25'
                            }`}
                          >
                            {chosen && <Check className="w-5 h-5" />}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {Object.keys(answers).length > 0 && (
                <button
                  type="button"
                  disabled={isRefining}
                  onClick={handleSubmitFollowUp}
                  className="min-h-[58px] w-full rounded-2xl bg-[#F59E0B] text-[#142316] font-extrabold text-lg px-4 shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {isRefining ? t.analyzing : t.refineAdvice}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mandatory Officer Confirmation Note for Serious Diagnoses */}
      {(result.severity === 'amber' || result.severity === 'red' || result.officerNote) && (
        <div className="rounded-3xl bg-[#1B5E20] text-white p-4 shadow-sm flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-[#F59E0B] shrink-0" />
          <p className="text-lg font-extrabold leading-snug">
            {result.officerNote || t.officerDefault}
          </p>
        </div>
      )}

      {/* Scan Another CTA */}
      <button
        type="button"
        onClick={onReset}
        className="min-h-[68px] w-full rounded-3xl bg-[#E3EBE0] text-[#142316] border-2 border-[#1B5E20]/20 font-extrabold text-xl px-5 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-transform"
      >
        <RotateCcw className="w-6 h-6 text-[#1B5E20]" />
        <span>{t.scanAnother}</span>
      </button>
    </div>
  );
};
