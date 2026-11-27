import React, { useEffect, useRef, useState } from 'react';
import {
  Languages,
  Home,
  Calculator,
  CalendarCheck,
  ImagePlus,
  Send,
  Loader2,
  AlertCircle,
  MicOff,
} from 'lucide-react';
import { AnalysisResult, AppTab, DiaryEntry, LanguageCode } from './types';
import { getLanguageOption, TRANSLATIONS } from './i18n/translations';
import {
  buildFullResultNarration,
  compressImageFile,
  createThumbnailDataUrl,
  speakText,
  stopSpeaking,
  unlockAudioPlayback,
} from './utils/speech';
import {
  FarmerMascotIcon,
  CameraLeafIcon,
  MicVoiceIcon,
} from './components/Icons';
import { LanguagePicker } from './components/LanguagePicker';
import { AudioWaveformBanner } from './components/AudioWaveformBanner';
import { AnalysisResultCard } from './components/AnalysisResultCard';
import { TankCalculator } from './components/TankCalculator';
import { SprayDiary } from './components/SprayDiary';
import { LiveVoiceChat } from './components/LiveVoiceChat';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallBanner';

const LANG_STORAGE_KEY = 'kisanvaani_language_v1';
const DIARY_STORAGE_KEY = 'kisanvaani_diary_v1';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export default function App() {
  const [language, setLanguage] = useState<LanguageCode | null>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'te' || saved === 'hi' || saved === 'ta' || saved === 'en') {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    return null;
  });

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Voice & text input states
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micWarning, setMicWarning] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');

  // Photo & analysis states
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null);
  const [lastQuestionSent, setLastQuestionSent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Tank calculator prefill
  const [calcDose, setCalcDose] = useState<number>(2);
  const [calcUnit, setCalcUnit] = useState<'ml' | 'g'>('ml');

  // 7-day spray diary
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    try {
      const raw = localStorage.getItem(DIARY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const latestTranscriptRef = useRef<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(diaryEntries));
    } catch {
      // Ignore quota errors
    }
  }, [diaryEntries]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  const handleSpeak = (text: string, langOverride?: LanguageCode) => {
    const activeLang = langOverride || language || 'en';
    speakText(text, activeLang, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleStopAudio = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleSelectLanguage = (chosen: LanguageCode) => {
    setLanguage(chosen);
    setShowLanguageModal(false);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, chosen);
    } catch {
      // Ignore
    }
    const langOpt = getLanguageOption(chosen);
    handleSpeak(langOpt.welcomeGreeting, chosen);
  };

  const runAnalysis = async (params: {
    imageDataUrl?: string | null;
    question?: string;
    followUpContext?: string;
    isFollowUp?: boolean;
  }) => {
    if (!language) return;
    const imgToUse = params.imageDataUrl ?? selectedImageDataUrl;
    const qToUse = (params.question ?? lastQuestionSent).trim();

    if (!imgToUse && !qToUse) return;

    if (params.isFollowUp) {
      setIsRefining(true);
    } else {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisResult(null);
    }

    stopSpeaking();
    setIsSpeaking(false);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgToUse || undefined,
          mimeType: 'image/jpeg',
          question: qToUse || undefined,
          language,
          followUpContext: params.followUpContext || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Request failed');
      }

      const result = data as AnalysisResult;
      setAnalysisResult(result);
      setLastQuestionSent(qToUse);

      handleSpeak(buildFullResultNarration(result, language), language);

      // Save to 7-day spray diary on initial analysis
      if (!params.isFollowUp) {
        const thumb = imgToUse ? await createThumbnailDataUrl(imgToUse, 160) : '';
        const newEntry: DiaryEntry = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: Date.now(),
          language,
          thumbnailDataUrl: thumb || undefined,
          question: qToUse || undefined,
          result,
          checkedRecovered: false,
        };
        setDiaryEntries((prev) => [newEntry, ...prev].slice(0, 30));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
      setIsRefining(false);
    }
  };

  const handleImagePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    unlockAudioPlayback();

    try {
      const compressed = await compressImageFile(file, 1024, 0.82);
      setSelectedImageDataUrl(compressed);
      await runAnalysis({
        imageDataUrl: compressed,
        question: questionText.trim(),
      });
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Could not read photo');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = questionText.trim();
    if (!trimmed) return;
    unlockAudioPlayback();
    runAnalysis({
      imageDataUrl: selectedImageDataUrl,
      question: trimmed,
    });
  };

  const handleToggleMic = () => {
    if (!language) return;
    setMicWarning(null);

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setMicWarning(TRANSLATIONS[language].micNotSupported);
      return;
    }

    stopSpeaking();
    setIsSpeaking(false);

    try {
      const recognition = new Ctor();
      const langOpt = getLanguageOption(language);
      recognition.lang = langOpt.speechLang;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;
      latestTranscriptRef.current = '';

      recognition.onresult = (event) => {
        let combined = '';
        for (let i = 0; i < event.results.length; i++) {
          combined += event.results[i][0].transcript;
        }
        const cleaned = combined.trim();
        latestTranscriptRef.current = cleaned;
        setQuestionText(cleaned);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setMicWarning(TRANSLATIONS[language].micNotSupported);
      };

      recognition.onend = () => {
        setIsListening(false);
        const spoken = latestTranscriptRef.current.trim();
        if (spoken) {
          runAnalysis({
            imageDataUrl: selectedImageDataUrl,
            question: spoken,
          });
        }
      };

      recognitionRef.current = recognition;
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      setMicWarning(TRANSLATIONS[language].micNotSupported);
    }
  };

  const handleResetScan = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setSelectedImageDataUrl(null);
    setQuestionText('');
    setLastQuestionSent('');
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleOpenCalculatorFromPacket = (dose: number, unit: 'ml' | 'g') => {
    setCalcDose(dose > 0 ? dose : 2);
    setCalcUnit(unit);
    setActiveTab('calculator');
  };

  const handleToggleRecovered = (id: string) => {
    setDiaryEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checkedRecovered: !item.checkedRecovered } : item
      )
    );
  };

  const handleDeleteEntry = (id: string) => {
    setDiaryEntries((prev) => prev.filter((item) => item.id !== id));
  };

  if (!language) {
    return <LanguagePicker onSelectLanguage={handleSelectLanguage} />;
  }

  const t = TRANSLATIONS[language];
  const langOpt = getLanguageOption(language);

  return (
    <div className="min-h-dvh w-full bg-[#EEF3EA] flex justify-center">
      {/* Sleek Mobile Container (max-width 430px) */}
      <div className="w-full max-w-[430px] min-h-dvh bg-[#F9FBF7] shadow-xl flex flex-col relative">
        {/* Compact Top Header (56px / <= 7% viewport height) */}
        <header className="sticky top-0 z-30 h-14 bg-[#1B5E20] text-white px-3.5 flex items-center justify-between gap-2 shadow-sm shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FarmerMascotIcon className="w-9 h-9 shrink-0" />
            <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
              KisanVaani
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton label={t.installApp} />
            <button
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="min-h-[44px] rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.97] transition-transform"
              aria-label={t.changeLanguage}
            >
              <Languages className="w-4 h-4 text-[#F59E0B]" />
              <span>{langOpt.nativeName}</span>
            </button>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 px-4 pt-4 pb-24 flex flex-col gap-4">
          <OfflineIndicator message={t.offlineBanner} />

          {activeTab === 'home' && (
            <>
              {isLiveChatOpen ? (
                <LiveVoiceChat
                  language={language}
                  onClose={() => setIsLiveChatOpen(false)}
                />
              ) : isAnalyzing ? (
                <div className="rounded-3xl bg-white border-2 border-[#1B5E20]/20 p-8 text-center shadow-sm flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#EEF3EA] flex items-center justify-center">
                    <Loader2 className="w-11 h-11 text-[#1B5E20] animate-spin" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#1B5E20]">
                      {t.analyzing}
                    </h2>
                    <p className="text-base font-semibold text-[#4B634E] mt-1">
                      {t.analyzingSub}
                    </p>
                  </div>
                </div>
              ) : analysisError ? (
                <div className="rounded-3xl bg-[#FEF2F2] border-2 border-[#EF4444] p-5 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-[#B91C1C]">
                    <AlertCircle className="w-8 h-8 shrink-0" />
                    <h2 className="text-xl font-extrabold">{t.errorTitle}</h2>
                  </div>
                  <p className="text-base font-bold text-[#7F1D1D]">
                    {analysisError}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedImageDataUrl || lastQuestionSent) {
                          void runAnalysis({
                            imageDataUrl: selectedImageDataUrl,
                            question: lastQuestionSent,
                          });
                        } else {
                          handleResetScan();
                        }
                      }}
                      className="min-h-[60px] w-full rounded-2xl bg-[#EF4444] text-white font-extrabold text-lg active:scale-[0.98]"
                    >
                      {t.errorRetry}
                    </button>
                    {(selectedImageDataUrl || lastQuestionSent) && (
                      <button
                        type="button"
                        onClick={handleResetScan}
                        className="min-h-[52px] w-full rounded-2xl bg-white border-2 border-[#EF4444]/40 text-[#991B1B] font-extrabold text-base active:scale-[0.98]"
                      >
                        {t.scanAnother}
                      </button>
                    )}
                  </div>
                </div>
              ) : analysisResult ? (
                <AnalysisResultCard
                  result={analysisResult}
                  language={language}
                  previewImage={selectedImageDataUrl || undefined}
                  isSpeaking={isSpeaking}
                  onReplayAudio={() => {
                    handleSpeak(buildFullResultNarration(analysisResult, language));
                  }}
                  onStopAudio={handleStopAudio}
                  onOpenCalculator={handleOpenCalculatorFromPacket}
                  onRefineWithFollowUp={(ctx) =>
                    runAnalysis({
                      imageDataUrl: selectedImageDataUrl,
                      question: lastQuestionSent,
                      followUpContext: ctx,
                      isFollowUp: true,
                    })
                  }
                  onReset={handleResetScan}
                  isRefining={isRefining}
                />
              ) : (
                /* THUMB-ZONE HOME SCREEN */
                <div className="flex flex-col gap-4">
                  {/* Spoken Greeting Banner */}
                  <AudioWaveformBanner
                    message={langOpt.homeGreeting}
                    isSpeaking={isSpeaking}
                    replayLabel={t.replayAudio}
                    stopLabel={t.stopAudio}
                    onReplay={() => handleSpeak(langOpt.homeGreeting)}
                    onStop={handleStopAudio}
                  />

                  {/* Hidden File Inputs: Direct Rear Camera & Gallery */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImagePicked}
                    className="hidden"
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImagePicked}
                    className="hidden"
                  />

                  {/* Massive Tactile 3D Button 1: Camera */}
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        unlockAudioPlayback();
                        cameraInputRef.current?.click();
                      }}
                      className="min-h-[120px] w-full rounded-3xl bg-[#1B5E20] border-b-[6px] border-[#0E3812] text-white px-5 py-4 shadow-md flex items-center gap-4 text-left active:translate-y-0.5 active:border-b-2 transition-all focus-visible:outline-4 focus-visible:outline-[#F59E0B]"
                    >
                      <CameraLeafIcon className="w-16 h-16 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-2xl font-extrabold leading-tight">
                          {t.takePhoto}
                        </div>
                        <div className="text-base font-semibold text-amber-200 mt-1">
                          {t.takePhotoSub}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        unlockAudioPlayback();
                        galleryInputRef.current?.click();
                      }}
                      className="min-h-[68px] w-full rounded-2xl bg-white border-2 border-[#1B5E20]/25 text-[#1B5E20] px-4 py-3 font-extrabold text-lg flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-transform"
                    >
                      <ImagePlus className="w-6 h-6 text-[#F59E0B] shrink-0" />
                      <span>{t.chooseGallery}</span>
                    </button>
                  </div>

                  {/* Massive Tactile 3D Button 2: Real-Time Live Voice Conversation (gemini-3.8-live) */}
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        setIsSpeaking(false);
                        setIsLiveChatOpen(true);
                      }}
                      className="min-h-[120px] w-full rounded-3xl px-5 py-4 shadow-md flex items-center gap-4 text-left bg-[#F59E0B] border-b-[6px] border-[#B45309] text-[#142316] active:translate-y-0.5 transition-all focus-visible:outline-4 focus-visible:outline-[#1B5E20]"
                    >
                      <MicVoiceIcon className="w-16 h-16 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-2xl font-extrabold leading-tight">
                          {t.liveButton}
                        </div>
                        <div className="text-base font-bold mt-1 text-[#3B2602]">
                          {t.liveButtonSub}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleMic}
                      className={`min-h-[60px] w-full rounded-2xl px-4 py-3 font-extrabold text-lg flex items-center justify-center gap-2.5 border-2 shadow-sm active:scale-[0.98] transition-transform ${
                        isListening
                          ? 'bg-[#EF4444] text-white border-[#991B1B]'
                          : 'bg-white text-[#1B5E20] border-[#1B5E20]/25'
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="w-6 h-6 shrink-0" />
                      ) : (
                        <Languages className="w-6 h-6 text-[#F59E0B] shrink-0" />
                      )}
                      <span>{isListening ? t.listening : t.micPrompt}</span>
                    </button>

                    {micWarning && (
                      <div className="rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B] px-4 py-2.5 text-sm font-bold text-[#92400E]">
                        {micWarning}
                      </div>
                    )}

                    {/* Clean Text-Input Fallback Box */}
                    <form
                      onSubmit={handleTextSubmit}
                      className="rounded-2xl bg-white border-2 border-[#1B5E20]/25 p-2 flex items-center gap-2 shadow-sm"
                    >
                      <input
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder={t.textPlaceholder}
                        className="flex-1 min-h-[52px] px-3 bg-transparent text-lg font-bold text-[#142316] placeholder:text-[#5F7462] focus:outline-none min-w-0"
                      />
                      <button
                        type="submit"
                        disabled={!questionText.trim()}
                        className="min-h-[52px] min-w-[68px] rounded-xl bg-[#1B5E20] text-white font-extrabold text-base px-4 flex items-center justify-center gap-1.5 disabled:opacity-40 active:scale-[0.97] transition-transform shrink-0"
                      >
                        <Send className="w-5 h-5" />
                        <span>{t.askButton}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'calculator' && (
            <TankCalculator
              language={language}
              initialDose={calcDose}
              initialUnit={calcUnit}
              onSpeakCalculation={(txt) => handleSpeak(txt)}
            />
          )}

          {activeTab === 'diary' && (
            <SprayDiary
              entries={diaryEntries}
              language={language}
              onSpeakEntry={(txt) => handleSpeak(txt)}
              onToggleRecovered={handleToggleRecovered}
              onDeleteEntry={handleDeleteEntry}
            />
          )}
        </main>

        {/* Bottom Tab Bar (64px height, total sticky <= 15% of mobile viewport) */}
        <nav
          aria-label="Main navigation"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white border-t-2 border-[#1B5E20]/15 grid grid-cols-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        >
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-0.5 font-extrabold transition-colors ${
              activeTab === 'home'
                ? 'text-[#1B5E20] bg-[#EEF3EA]'
                : 'text-[#4B634E] hover:text-[#1B5E20]'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs leading-none whitespace-nowrap">{t.tabHome}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLiveChatOpen(false);
              setActiveTab('calculator');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 font-extrabold transition-colors ${
              activeTab === 'calculator'
                ? 'text-[#1B5E20] bg-[#EEF3EA]'
                : 'text-[#4B634E] hover:text-[#1B5E20]'
            }`}
          >
            <Calculator className="w-6 h-6" />
            <span className="text-xs leading-none whitespace-nowrap">{t.tabCalc}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLiveChatOpen(false);
              setActiveTab('diary');
            }}
            className={`flex flex-col items-center justify-center gap-0.5 font-extrabold transition-colors relative ${
              activeTab === 'diary'
                ? 'text-[#1B5E20] bg-[#EEF3EA]'
                : 'text-[#4B634E] hover:text-[#1B5E20]'
            }`}
          >
            <CalendarCheck className="w-6 h-6" />
            <span className="text-xs leading-none whitespace-nowrap">
              {t.tabDiary}
              {diaryEntries.length > 0 ? ` (${diaryEntries.length})` : ''}
            </span>
          </button>
        </nav>

        {/* Language Switcher Modal */}
        {showLanguageModal && (
          <LanguagePicker
            selectedLanguage={language}
            onSelectLanguage={handleSelectLanguage}
            isModal
            onClose={() => setShowLanguageModal(false)}
          />
        )}
      </div>
    </div>
  );
}
