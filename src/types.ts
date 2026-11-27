export type LanguageCode = 'te' | 'hi' | 'ta' | 'en';

export type SeverityLevel = 'green' | 'amber' | 'red';

export type AppTab = 'home' | 'calculator' | 'diary';

export interface PacketDetails {
  whatItIsFor: string;
  dosagePerLitre: string;
  dosagePerAcre: string;
  numericDosagePerLitre: number;
  dosageUnit: 'ml' | 'g';
  whenToSprayAndSafety: string;
  waitingPeriodBeforeHarvest: string;
  isBannedOrUnsafe: boolean;
  banOrMixWarning: string;
}

export interface PlantDetails {
  likelyCause: string;
  followUpQuestions: string[];
  tier1Organic: string;
  tier2Cultural: string;
  tier3Chemical: string;
}

export interface AnalysisResult {
  category: 'packet' | 'plant' | 'general';
  title: string;
  severity: SeverityLevel;
  spokenSummary: string;
  packetDetails?: PacketDetails;
  plantDetails?: PlantDetails;
  officerNote?: string;
}

export interface DiaryEntry {
  id: string;
  createdAt: number;
  language: LanguageCode;
  thumbnailDataUrl?: string;
  question?: string;
  result: AnalysisResult;
  checkedRecovered?: boolean;
}
