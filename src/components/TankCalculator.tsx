import React, { useState } from 'react';
import { Minus, Plus, Volume2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { TankSprayerIcon } from './Icons';

interface TankCalculatorProps {
  language: LanguageCode;
  initialDose: number;
  initialUnit: 'ml' | 'g';
  onSpeakCalculation: (text: string) => void;
}

const ACRE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const TANK_SIZES = [15, 16, 20];
const DOSE_PRESETS = [1, 2, 2.5, 3, 5];

export const TankCalculator: React.FC<TankCalculatorProps> = ({
  language,
  initialDose,
  initialUnit,
  onSpeakCalculation,
}) => {
  const t = TRANSLATIONS[language];
  const [acres, setAcres] = useState<number>(1);
  const [tankSize, setTankSize] = useState<number>(16);
  const [dosePerLitre, setDosePerLitre] = useState<number>(initialDose > 0 ? initialDose : 2);
  const [unit, setUnit] = useState<'ml' | 'g'>(initialUnit);

  // Standard Indian foliar spray volume ~200 Litres per acre
  const totalWaterLitres = acres * 200;
  const totalTanks = Math.ceil(totalWaterLitres / tankSize);
  const perTankAmount = Number((dosePerLitre * tankSize).toFixed(1));
  const totalChemicalAmount = Number((dosePerLitre * totalWaterLitres).toFixed(1));

  const formatTotalChemical = () => {
    if (totalChemicalAmount >= 1000) {
      const bigUnit = unit === 'ml' ? 'L' : 'kg';
      return `${(totalChemicalAmount / 1000).toFixed(2)} ${bigUnit}`;
    }
    return `${totalChemicalAmount} ${unit}`;
  };

  const handleReadAloud = () => {
    const unitWord = unit === 'ml' ? 'ml' : 'grams';
    const textByLang: Record<LanguageCode, string> = {
      te: `${acres} ఎకరాలకు ${tankSize} లీటర్ల ట్యాంకులు మొత్తం ${totalTanks} అవసరం. ఒక్కో ట్యాంకులో ${perTankAmount} ${unit === 'ml' ? 'మిల్లీలీటర్లు' : 'గ్రాములు'} కలపండి.`,
      hi: `${acres} एकड़ के लिए ${tankSize} लीटर की कुल ${totalTanks} टंकी लगेंगी। हर टंकी में ${perTankAmount} ${unit === 'ml' ? 'एमएल' : 'ग्राम'} दवा डालें।`,
      ta: `${acres} ஏக்கருக்கு ${tankSize} லிட்டர் டேங்குகள் மொத்தம் ${totalTanks} தேவை. ஒரு டேங்கிற்கு ${perTankAmount} ${unit === 'ml' ? 'மில்லி' : 'கிராம்'} கலக்கவும்.`,
      en: `For ${acres} acres using a ${tankSize} litre tank, you need ${totalTanks} tanks. Mix ${perTankAmount} ${unitWord} per tank.`,
    };
    onSpeakCalculation(textByLang[language]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex items-center gap-3">
        <TankSprayerIcon className="w-12 h-12 shrink-0" />
        <div>
          <h2 className="text-2xl font-extrabold text-[#1B5E20]">{t.calcTitle}</h2>
          <p className="text-sm font-semibold text-[#4B634E]">{t.calcWaterNote}</p>
        </div>
      </div>

      {/* Step 1: Select Acres (1-10) */}
      <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex flex-col gap-3">
        <span className="text-lg font-extrabold text-[#142316]">{t.calcAcres}</span>
        <div className="grid grid-cols-5 gap-2">
          {ACRE_OPTIONS.map((a) => {
            const active = acres === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setAcres(a)}
                className={`min-h-[56px] rounded-2xl font-extrabold text-xl tabular-nums border-2 transition-transform active:scale-[0.96] ${
                  active
                    ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-sm'
                    : 'bg-[#F9FBF7] text-[#142316] border-[#1B5E20]/20'
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Tank Size (15L, 16L, 20L) */}
      <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex flex-col gap-3">
        <span className="text-lg font-extrabold text-[#142316]">{t.calcTankSize}</span>
        <div className="grid grid-cols-3 gap-2.5">
          {TANK_SIZES.map((size) => {
            const active = tankSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setTankSize(size)}
                className={`min-h-[68px] rounded-2xl font-extrabold text-2xl tabular-nums border-2 transition-transform active:scale-[0.96] ${
                  active
                    ? 'bg-[#F59E0B] text-[#142316] border-[#D97706] shadow-sm'
                    : 'bg-[#F9FBF7] text-[#142316] border-[#1B5E20]/20'
                }`}
              >
                {size}L
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Chemical Dose per Litre */}
      <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/15 p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-extrabold text-[#142316]">{t.calcDosePerLitre}</span>
          <div className="flex items-center gap-1 bg-[#EEF3EA] p-1 rounded-xl">
            {(['ml', 'g'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`min-h-[40px] px-3.5 rounded-lg font-extrabold text-base ${
                  unit === u
                    ? 'bg-[#1B5E20] text-white'
                    : 'text-[#142316]'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Decrease dosage"
            onClick={() => setDosePerLitre((d) => Math.max(0.5, Number((d - 0.5).toFixed(1))))}
            className="min-h-[60px] min-w-[60px] rounded-2xl bg-[#EEF3EA] text-[#1B5E20] flex items-center justify-center active:scale-[0.95]"
          >
            <Minus className="w-7 h-7" />
          </button>

          <div className="text-3xl font-extrabold text-[#142316] tabular-nums">
            {dosePerLitre} {unit}/L
          </div>

          <button
            type="button"
            aria-label="Increase dosage"
            onClick={() => setDosePerLitre((d) => Math.min(25, Number((d + 0.5).toFixed(1))))}
            className="min-h-[60px] min-w-[60px] rounded-2xl bg-[#EEF3EA] text-[#1B5E20] flex items-center justify-center active:scale-[0.95]"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {DOSE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDosePerLitre(preset)}
              className={`min-h-[48px] rounded-xl font-bold text-base tabular-nums border ${
                dosePerLitre === preset
                  ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                  : 'bg-[#F9FBF7] text-[#142316] border-[#1B5E20]/20'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Results Banner */}
      <div className="rounded-3xl bg-[#1B5E20] text-white p-5 shadow-md flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3.5">
            <div className="text-sm font-bold text-amber-200">{t.calcPerTank}</div>
            <div className="text-3xl font-extrabold mt-1 tabular-nums">
              {perTankAmount} <span className="text-xl">{unit}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3.5">
            <div className="text-sm font-bold text-amber-200">{t.calcTotalTanks}</div>
            <div className="text-3xl font-extrabold mt-1 tabular-nums">
              {totalTanks}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F59E0B] text-[#142316] p-3.5 flex items-center justify-between">
          <span className="text-base font-extrabold">{t.calcTotalNeeded}</span>
          <span className="text-2xl font-extrabold tabular-nums">
            {formatTotalChemical()}
          </span>
        </div>

        <button
          type="button"
          onClick={handleReadAloud}
          className="min-h-[60px] w-full rounded-2xl bg-white text-[#1B5E20] font-extrabold text-lg px-4 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-transform"
        >
          <Volume2 className="w-6 h-6 text-[#F59E0B]" />
          <span>{t.calcReadAloud}</span>
        </button>
      </div>
    </div>
  );
};
