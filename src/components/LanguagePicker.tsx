import React from 'react';
import { Volume2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGE_OPTIONS, TRANSLATIONS } from '../i18n/translations';
import { FarmerMascotIcon } from './Icons';

interface LanguagePickerProps {
  selectedLanguage?: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  selectedLanguage,
  onSelectLanguage,
  isModal = false,
  onClose,
}) => {
  const activeCopy = TRANSLATIONS[selectedLanguage || 'en'];

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          : 'min-h-dvh w-full flex items-center justify-center bg-[#EEF3EA] p-3 sm:p-4'
      }
      role="dialog"
      aria-modal="true"
      aria-label="Choose language"
    >
      <div className="w-full max-w-[430px] rounded-3xl bg-[#F9FBF7] border-2 border-[#1B5E20]/15 shadow-xl p-6 flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full bg-[#1B5E20] flex items-center justify-center shadow-md">
            <FarmerMascotIcon className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1B5E20]">
              KisanVaani
            </h1>
            <p className="mt-1 text-lg font-bold text-[#142316]">
              {activeCopy.welcomeSubtitle}
            </p>
            <p className="text-sm font-medium text-[#3F5241] mt-0.5 flex items-center justify-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#F59E0B]" />
              <span>{activeCopy.tapToStart}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {LANGUAGE_OPTIONS.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={`min-h-[72px] w-full rounded-2xl px-5 py-4 flex items-center justify-between transition-transform active:scale-[0.98] focus-visible:outline-4 focus-visible:outline-[#F59E0B] border-2 ${
                  isSelected
                    ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-md'
                    : 'bg-white text-[#142316] border-[#1B5E20]/25 hover:border-[#1B5E20] shadow-sm'
                }`}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-2xl font-extrabold leading-tight">
                    {lang.nativeName}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-amber-200' : 'text-[#4B634E]'
                    }`}
                  >
                    {lang.englishName}
                  </span>
                </div>
                <span
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#F59E0B] text-[#142316]' : 'bg-[#EEF3EA] text-[#1B5E20]'
                  }`}
                >
                  <Volume2 className="w-6 h-6" />
                </span>
              </button>
            );
          })}
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[56px] w-full rounded-2xl bg-[#E3EBE0] text-[#142316] font-bold text-lg hover:bg-[#D5E2D1] active:scale-[0.98] transition-transform"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
