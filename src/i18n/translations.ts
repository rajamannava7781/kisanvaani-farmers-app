import { LanguageCode } from '../types';

export interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  speechLang: string;
  welcomeGreeting: string;
  homeGreeting: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    speechLang: 'te-IN',
    welcomeGreeting: 'నమస్కారం! కిసాన్‌వాణికి స్వాగతం. మందు ప్యాకెట్ లేదా రోగం వచ్చిన మొక్క ఫోటో చూపించండి.',
    homeGreeting: 'నమస్కారం, మందు ప్యాకెట్ లేదా రోగం వచ్చిన మొక్కను చూపించండి',
  },
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    speechLang: 'hi-IN',
    welcomeGreeting: 'नमस्ते! किसानवाणी में आपका स्वागत है। दवाई का पैकेट या बीमार पौधा दिखाएं।',
    homeGreeting: 'नमस्ते, मुझे पैकेट या बीमार पौधा दिखाएं',
  },
  {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    speechLang: 'ta-IN',
    welcomeGreeting: 'வணக்கம்! கிசான்வாணிக்கு வரவேற்கிறோம். மருந்து பாக்கெட் அல்லது நோய்வாய்ப்பட்ட செடியைக் காட்டுங்கள்.',
    homeGreeting: 'வணக்கம், மருந்து பாக்கெட் அல்லது நோயுற்ற செடியைக் காட்டுங்கள்',
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    speechLang: 'en-IN',
    welcomeGreeting: 'Namaste! Welcome to KisanVaani. Show me the packet or the sick plant.',
    homeGreeting: 'Namaste, show me the packet or the sick plant',
  },
];

export interface UITranslations {
  welcomeSubtitle: string;
  tapToStart: string;
  changeLanguage: string;
  installApp: string;
  replayAudio: string;
  stopAudio: string;
  listening: string;
  speaking: string;
  takePhoto: string;
  takePhotoSub: string;
  chooseGallery: string;
  micPrompt: string;
  micSub: string;
  micStop: string;
  textPlaceholder: string;
  askButton: string;
  analyzing: string;
  analyzingSub: string;
  tabHome: string;
  tabCalc: string;
  tabDiary: string;
  severityGreen: string;
  severityAmber: string;
  severityRed: string;
  packetWhatFor: string;
  packetDosageLitre: string;
  packetDosageAcre: string;
  packetSpraySafety: string;
  packetHarvestWait: string;
  packetWarning: string;
  openInCalc: string;
  plantCause: string;
  plantQuestionsTitle: string;
  tier1Label: string;
  tier2Label: string;
  tier3Label: string;
  yes: string;
  no: string;
  recent: string;
  older: string;
  refineAdvice: string;
  officerDefault: string;
  scanAnother: string;
  calcTitle: string;
  calcAcres: string;
  calcTankSize: string;
  calcDosePerLitre: string;
  calcTotalTanks: string;
  calcPerTank: string;
  calcTotalNeeded: string;
  calcWaterNote: string;
  calcReadAloud: string;
  diaryTitle: string;
  diaryEmpty: string;
  diaryEmptySub: string;
  diaryCheckToday: string;
  diaryCheckInDays: string;
  diaryRecovered: string;
  diaryMarkDone: string;
  diaryDelete: string;
  offlineBanner: string;
  errorTitle: string;
  errorRetry: string;
  micNotSupported: string;
  liveTitle: string;
  liveButton: string;
  liveButtonSub: string;
  liveConnecting: string;
  liveListening: string;
  liveSpeaking: string;
  liveMuted: string;
  liveMute: string;
  liveUnmute: string;
  liveEndCall: string;
  liveShowPhoto: string;
  livePhotoSent: string;
  liveTypePlaceholder: string;
  liveWelcomeHint: string;
  liveMicDenied: string;
}

export const TRANSLATIONS: Record<LanguageCode, UITranslations> = {
  te: {
    welcomeSubtitle: 'మీ భాషను ఎంచుకోండి',
    tapToStart: 'వినిపించడానికి నొక్కండి',
    changeLanguage: 'భాష',
    installApp: 'యాప్ ఇన్‌స్టాల్',
    replayAudio: 'మళ్లీ వినండి',
    stopAudio: 'ఆపండి',
    listening: 'వింటున్నాను... మాట్లాడండి',
    speaking: 'మాట్లాడుతోంది...',
    takePhoto: 'ఫోటో తీయండి',
    takePhotoSub: 'ప్యాకెట్ లేదా ఆకు ఫోటో',
    chooseGallery: 'గ్యాలరీ నుండి ఎంచుకోండి',
    micPrompt: 'మాట్లాడి అడగండి',
    micSub: 'బటన్ నొక్కి తెలుగులో అడగండి',
    micStop: 'ఆపడానికి నొక్కండి',
    textPlaceholder: 'లేదా ఇక్కడ టైప్ చేయండి (ఉదా: ఆకుపై మచ్చలు)...',
    askButton: 'అడగండి',
    analyzing: 'పరిశీలిస్తున్నాము...',
    analyzingSub: 'దయచేసి ఒక్క క్షణం ఆగండి',
    tabHome: 'హోమ్',
    tabCalc: 'ట్యాంక్ లెక్క',
    tabDiary: '7 రోజుల డైరీ',
    severityGreen: 'సురక్షితం / ఆరోగ్యంగా ఉంది',
    severityAmber: 'జాగ్రత్తగా గమనించండి',
    severityRed: 'వెంటనే చర్య తీసుకోండి',
    packetWhatFor: 'ఇది దేనికి పనిచేస్తుంది',
    packetDosageLitre: 'లీటరు నీటికి మోతాదు',
    packetDosageAcre: 'ఎకరాకు మోతాదు',
    packetSpraySafety: 'ఎప్పుడు చల్లాలి & జాగ్రత్తలు',
    packetHarvestWait: 'కోతకు ముందు ఆగాల్సిన రోజులు',
    packetWarning: 'హెచ్చరిక / కలపకూడదు',
    openInCalc: 'ట్యాంక్ లెక్కలో చూడండి',
    plantCause: 'సంభావ్య కారణం',
    plantQuestionsTitle: 'మరింత ఖచ్చితమైన సలహా కోసం 2 ప్రశ్నలు:',
    tier1Label: '1. ముందు సేంద్రీయ చిట్కా',
    tier2Label: '2. పంట సంరక్షణ',
    tier3Label: '3. చివరిగా రసాయన మందు',
    yes: 'అవును',
    no: 'కాదు',
    recent: '2 రోజుల్లో',
    older: 'వారం క్రితం',
    refineAdvice: 'సలహా మెరుగుపరచండి',
    officerDefault: 'దయచేసి మీ స్థానిక వ్యవసాయ అధికారితో నిర్ధారించుకోండి.',
    scanAnother: 'మరో ఫోటో / ప్రశ్న',
    calcTitle: 'ట్యాంక్ & ఎకరాల లెక్క',
    calcAcres: 'ఎకరాలు ఎంచుకోండి',
    calcTankSize: 'స్ప్రే ట్యాంక్ సైజు',
    calcDosePerLitre: 'లీటరు నీటికి మందు',
    calcTotalTanks: 'మొత్తం ట్యాంకులు',
    calcPerTank: 'ఒక్కో ట్యాంకులో మందు',
    calcTotalNeeded: 'మొత్తం కావాల్సిన మందు',
    calcWaterNote: 'ఎకరాకు సుమారు 200 లీటర్ల నీరు లెక్కన',
    calcReadAloud: 'లెక్క వినిపించు',
    diaryTitle: '7 రోజుల స్ప్రే డైరీ',
    diaryEmpty: 'ఇంకా ఏ రికార్డులు లేవు',
    diaryEmptySub: 'ప్యాకెట్ లేదా ఆకు ఫోటో తీస్తే ఇక్కడ సేవ్ అవుతుంది.',
    diaryCheckToday: '7వ రోజు తనిఖీ సిద్ధం!',
    diaryCheckInDays: 'రోజుల్లో మళ్లీ చూడండి',
    diaryRecovered: 'పంట బాగుంది',
    diaryMarkDone: 'బాగైందని గుర్తించు',
    diaryDelete: 'తొలగించు',
    offlineBanner: 'ఇంటర్నెట్ లేదు — సేవ్ చేసిన డైరీ & లెక్క వాడుకోవచ్చు',
    errorTitle: 'సమాచారం అందలేదు',
    errorRetry: 'మళ్లీ ప్రయత్నించండి',
    micNotSupported: 'ఈ బ్రౌజర్‌లో వాయిస్ అందుబాటులో లేదు. కింద టైప్ చేయండి.',
    liveTitle: 'కిసాన్‌వాణి లైవ్ సంభాషణ',
    liveButton: 'లైవ్‌లో మాట్లాడండి',
    liveButtonSub: 'మీ పంట సమస్యను నేరుగా చెప్పండి',
    liveConnecting: 'కలుపుతున్నాము...',
    liveListening: 'వింటున్నాను — మీ సమస్యను చెప్పండి',
    liveSpeaking: 'కిసాన్‌వాణి చెబుతోంది...',
    liveMuted: 'మైక్ ఆఫ్‌లో ఉంది',
    liveMute: 'మైక్ ఆఫ్',
    liveUnmute: 'మైక్ ఆన్',
    liveEndCall: 'మాట ఆపండి',
    liveShowPhoto: 'ఫోటో చూపించు',
    livePhotoSent: 'ఫోటో పంపబడింది',
    liveTypePlaceholder: 'లేదా ఇక్కడ సందేశం పంపండి...',
    liveWelcomeHint: 'నమస్కారం! మీ పంట సమస్య గురించి తెలుగులో మాట్లాడండి. నేను వింటున్నాను.',
    liveMicDenied: 'మైక్ అనుమతి లేదు. కింద టైప్ చేసి మాట్లాడండి.',
  },
  hi: {
    welcomeSubtitle: 'अपनी भाषा चुनें',
    tapToStart: 'सुनने के लिए दबाएं',
    changeLanguage: 'भाषा',
    installApp: 'ऐप इंस्टॉल',
    replayAudio: 'फिर से सुनें',
    stopAudio: 'रोकें',
    listening: 'सुन रहा हूँ... बोलिए',
    speaking: 'बोल रहा है...',
    takePhoto: 'फोटो खींचें',
    takePhotoSub: 'दवाई का पैकेट या बीमार पत्ता',
    chooseGallery: 'गैलरी से फोटो चुनें',
    micPrompt: 'बोलकर पूछें',
    micSub: 'बटन दबाएं और हिंदी में बोलें',
    micStop: 'रोकने के लिए दबाएं',
    textPlaceholder: 'या यहाँ लिखें (जैसे: पत्तियों पर पीले धब्बे)...',
    askButton: 'पूछें',
    analyzing: 'जाँच हो रही है...',
    analyzingSub: 'कृपया थोड़ा इंतज़ार करें',
    tabHome: 'होम',
    tabCalc: 'टंकी हिसाब',
    tabDiary: '7-दिन डायरी',
    severityGreen: 'सुरक्षित / स्वस्थ',
    severityAmber: 'ध्यान दें / निगरानी रखें',
    severityRed: 'तुरंत कदम उठाएं',
    packetWhatFor: 'यह किस काम आता है',
    packetDosageLitre: 'प्रति लीटर पानी की मात्रा',
    packetDosageAcre: 'प्रति एकड़ मात्रा',
    packetSpraySafety: 'कब छिड़कें और सुरक्षा',
    packetHarvestWait: 'कटाई से पहले रुकने के दिन',
    packetWarning: 'चेतावनी / न मिलाएं',
    openInCalc: 'टंकी हिसाब में खोलें',
    plantCause: 'संभावित कारण',
    plantQuestionsTitle: 'सही सलाह के लिए 2 आसान सवाल:',
    tier1Label: '1. पहले जैविक उपाय',
    tier2Label: '2. खेत की देखभाल',
    tier3Label: '3. अंत में रासायनिक दवा',
    yes: 'हाँ',
    no: 'नहीं',
    recent: 'अभी शुरू',
    older: '1 हफ्ते से',
    refineAdvice: 'सलाह अपडेट करें',
    officerDefault: 'कृपया अपने स्थानीय कृषि अधिकारी से पुष्टि जरूर करें।',
    scanAnother: 'नया फोटो / सवाल',
    calcTitle: 'टंकी और एकड़ कैलकुलेटर',
    calcAcres: 'एकड़ चुनें',
    calcTankSize: 'स्प्रे टंकी का साइज',
    calcDosePerLitre: 'प्रति लीटर दवा की मात्रा',
    calcTotalTanks: 'कुल टंकियां लगेंगी',
    calcPerTank: 'हर टंकी में दवा',
    calcTotalNeeded: 'कुल दवा लगेगी',
    calcWaterNote: 'प्रति एकड़ लगभग 200 लीटर पानी के आधार पर',
    calcReadAloud: 'हिसाब बोलकर सुनें',
    diaryTitle: '7-दिन स्प्रे डायरी',
    diaryEmpty: 'अभी कोई रिकॉर्ड नहीं है',
    diaryEmptySub: 'पैकेट या फसल की फोटो लेने पर यहाँ अपने आप सेव होगा।',
    diaryCheckToday: '7वें दिन की जाँच तैयार!',
    diaryCheckInDays: 'दिन बाद फिर जाँचें',
    diaryRecovered: 'फसल ठीक है',
    diaryMarkDone: 'ठीक हुआ लिखें',
    diaryDelete: 'हटाएं',
    offlineBanner: 'ऑफ़लाइन मोड — सेव की गई डायरी और टंकी हिसाब चालू है',
    errorTitle: 'जाँच पूरी नहीं हो सकी',
    errorRetry: 'फिर कोशिश करें',
    micNotSupported: 'इस फोन में माइक उपलब्ध नहीं है। नीचे लिखकर पूछें।',
    liveTitle: 'किसानवाणी लाइव बातचीत',
    liveButton: 'सीधे बात करें (लाइव)',
    liveButtonSub: 'अपनी फसल की समस्या बोलकर बताएं',
    liveConnecting: 'जुड़ रहे हैं...',
    liveListening: 'सुन रहा हूँ — आराम से बोलिए',
    liveSpeaking: 'किसानवाणी बोल रहा है...',
    liveMuted: 'माइक बंद है',
    liveMute: 'माइक बंद',
    liveUnmute: 'माइक चालू',
    liveEndCall: 'बातचीत बंद करें',
    liveShowPhoto: 'फोटो दिखाएं',
    livePhotoSent: 'फोटो भेजा गया',
    liveTypePlaceholder: 'या यहाँ लिखकर भेजें...',
    liveWelcomeHint: 'नमस्ते! अपनी फसल या खाद-दवाई की समस्या हिंदी में बोलकर बताएं। मैं सुन रहा हूँ।',
    liveMicDenied: 'माइक की अनुमति नहीं मिली। नीचे लिखकर बात करें।',
  },
  ta: {
    welcomeSubtitle: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    tapToStart: 'கேட்கத் தட்டவும்',
    changeLanguage: 'மொழி',
    installApp: 'நிறுவு',
    replayAudio: 'மீண்டும் கேட்கவும்',
    stopAudio: 'நிறுத்து',
    listening: 'கேட்கிறேன்... பேசுங்கள்',
    speaking: 'பேசுகிறது...',
    takePhoto: 'புகைப்படம் எடு',
    takePhotoSub: 'மருந்து பாக்கெட் அல்லது இலை',
    chooseGallery: 'கேலரியில் இருந்து தேர்வு செய்',
    micPrompt: 'பேசி கேளுங்கள்',
    micSub: 'பொத்தானை அழுத்தி தமிழில் கேளுங்கள்',
    micStop: 'நிறுத்த அழுத்தவும்',
    textPlaceholder: 'அல்லது இங்கே தட்டச்சு செய்க (எ.கா: இலையில் புள்ளி)...',
    askButton: 'கேளுங்கள்',
    analyzing: 'பரிசோதிக்கிறது...',
    analyzingSub: 'தயவுசெய்து சற்று காத்திருக்கவும்',
    tabHome: 'முகப்பு',
    tabCalc: 'டேங்க் கணக்கு',
    tabDiary: '7-நாள் நாட்குறிப்பு',
    severityGreen: 'பாதுகாப்பானது / ஆரோக்கியம்',
    severityAmber: 'கவனிக்கவும்',
    severityRed: 'உடனே நடவடிக்கை தேவை',
    packetWhatFor: 'இது எதற்குப் பயன்படும்',
    packetDosageLitre: 'ஒரு லிட்டர் தண்ணீருக்கு அளவு',
    packetDosageAcre: 'ஒரு ஏக்கருக்கு அளவு',
    packetSpraySafety: 'எப்போது தெளிக்க & பாதுகாப்பு',
    packetHarvestWait: 'அறுவடைக்கு முன் காத்திருப்பு',
    packetWarning: 'எச்சரிக்கை / கலக்காதீர்',
    openInCalc: 'டேங்க் கணக்கில் பார்',
    plantCause: 'காரணம்',
    plantQuestionsTitle: 'சரியான ஆலோசனைக்கு 2 எளிய கேள்விகள்:',
    tier1Label: '1. முதலில் இயற்கை வழி',
    tier2Label: '2. பயிர் பராமரிப்பு',
    tier3Label: '3. கடைசியாக ரசாயன மருந்து',
    yes: 'ஆம்',
    no: 'இல்லை',
    recent: 'சமீபத்தில்',
    older: 'ஒரு வாரம்',
    refineAdvice: 'ஆலோசனையைப் புதுப்பி',
    officerDefault: 'தயவுசெய்து உங்கள் உள்ளூர் வேளாண் அதிகாரியிடம் உறுதிப்படுத்தவும்.',
    scanAnother: 'மற்றொரு படம் / கேள்வி',
    calcTitle: 'டேங்க் & ஏக்கர் கணக்கிடு',
    calcAcres: 'ஏக்கர் எண்ணிக்கை',
    calcTankSize: 'ஸ்ப்ரே டேங்க் அளவு',
    calcDosePerLitre: 'லிட்டருக்கு மருந்து அளவு',
    calcTotalTanks: 'மொத்த டேங்குகள்',
    calcPerTank: 'ஒரு டேங்கில் மருந்து',
    calcTotalNeeded: 'மொத்த மருந்து தேவை',
    calcWaterNote: 'ஏக்கருக்கு சுமார் 200 லிட்டர் தண்ணீர் கணக்கில்',
    calcReadAloud: 'கணக்கைக் கேளுங்கள்',
    diaryTitle: '7-நாள் தெளிப்பு நாட்குறிப்பு',
    diaryEmpty: 'பதிவுகள் இன்னும் இல்லை',
    diaryEmptySub: 'பாக்கெட் அல்லது பயிர் படம் எடுத்தால் இங்கே சேமிக்கப்படும்.',
    diaryCheckToday: '7-ஆம் நாள் சரிபார்ப்பு தயார்!',
    diaryCheckInDays: 'நாட்களில் சரிபார்க்கவும்',
    diaryRecovered: 'பயிர் நலமானது',
    diaryMarkDone: 'நலமானது எனக் குறி',
    diaryDelete: 'நீக்கு',
    offlineBanner: 'ஆஃப்லைன் — சேமித்த நாட்குறிப்பு & டேங்க் கணக்கு இயங்கும்',
    errorTitle: 'தகவல் கிடைக்கவில்லை',
    errorRetry: 'மீண்டும் முயற்சி செய்',
    micNotSupported: 'குரல் பதிவு இல்லை. கீழே தட்டச்சு செய்க.',
    liveTitle: 'கிசான்வாணி நேரலை உரையாடல்',
    liveButton: 'நேரலையில் பேசுங்கள்',
    liveButtonSub: 'பயிர் பிரச்சனையை நேராகப் பேசிச் சொல்லுங்கள்',
    liveConnecting: 'இணைக்கிறது...',
    liveListening: 'கேட்கிறேன் — தாராளமாகப் பேசுங்கள்',
    liveSpeaking: 'கிசான்வாணி பேசுகிறது...',
    liveMuted: 'மைக் நிறுத்தப்பட்டுள்ளது',
    liveMute: 'மைக் நிறுத்து',
    liveUnmute: 'மைக் இயக்கு',
    liveEndCall: 'பேச்சை முடி',
    liveShowPhoto: 'படம் காட்டு',
    livePhotoSent: 'படம் அனுப்பப்பட்டது',
    liveTypePlaceholder: 'அல்லது இங்கே தட்டச்சு செய்யவும்...',
    liveWelcomeHint: 'வணக்கம்! உங்கள் பயிர் பிரச்சனையை தமிழில் பேசிச் சொல்லுங்கள். நான் கேட்கிறேன்.',
    liveMicDenied: 'மைக் அனுமதி இல்லை. கீழே தட்டச்சு செய்து பேசவும்.',
  },
  en: {
    welcomeSubtitle: 'Choose your language',
    tapToStart: 'Tap to listen & start',
    changeLanguage: 'Language',
    installApp: 'Install App',
    replayAudio: 'Listen Again',
    stopAudio: 'Stop Audio',
    listening: 'Listening... Speak now',
    speaking: 'Speaking aloud...',
    takePhoto: 'Take Photo',
    takePhotoSub: 'Pesticide packet or sick plant',
    chooseGallery: 'Upload Photo from Gallery',
    micPrompt: 'Ask by Voice',
    micSub: 'Tap mic & speak your question',
    micStop: 'Tap to Stop',
    textPlaceholder: 'Or type here (e.g., yellow spots on tomato leaf)...',
    askButton: 'Ask',
    analyzing: 'Checking photo & question...',
    analyzingSub: 'Please wait a moment',
    tabHome: 'Home',
    tabCalc: 'Tank Calc',
    tabDiary: '7-Day Diary',
    severityGreen: 'Safe / Healthy',
    severityAmber: 'Watch Carefully',
    severityRed: 'Act Now',
    packetWhatFor: 'What it is for',
    packetDosageLitre: 'Dosage per Litre',
    packetDosageAcre: 'Dosage per Acre',
    packetSpraySafety: 'When to spray & safety gear',
    packetHarvestWait: 'Wait before harvest',
    packetWarning: 'Danger / Do Not Mix Warning',
    openInCalc: 'Calculate in Tank Mixer',
    plantCause: 'Likely Cause',
    plantQuestionsTitle: '2 Quick Questions for Better Advice:',
    tier1Label: '1. Organic Remedy First',
    tier2Label: '2. Cultural Care Second',
    tier3Label: '3. Chemical Option Last',
    yes: 'Yes',
    no: 'No',
    recent: 'Last 2 days',
    older: 'Over a week',
    refineAdvice: 'Update Advice',
    officerDefault: 'Please confirm with your local agriculture officer.',
    scanAnother: 'Scan Another / New Question',
    calcTitle: 'Tank & Acre Calculator',
    calcAcres: 'Select Acres',
    calcTankSize: 'Sprayer Tank Size',
    calcDosePerLitre: 'Medicine per Litre',
    calcTotalTanks: 'Total Tanks Needed',
    calcPerTank: 'Amount per Tank',
    calcTotalNeeded: 'Total Chemical Needed',
    calcWaterNote: 'Based on standard 200 Litres water per acre',
    calcReadAloud: 'Read Calculation Aloud',
    diaryTitle: '7-Day Spray Diary',
    diaryEmpty: 'No scans saved yet',
    diaryEmptySub: 'Every packet or crop scan is saved here with a 7-day checkup reminder.',
    diaryCheckToday: 'Day 7 Recovery Check Due!',
    diaryCheckInDays: 'days to checkup',
    diaryRecovered: 'Crop Recovered',
    diaryMarkDone: 'Mark Recovered',
    diaryDelete: 'Remove',
    offlineBanner: 'Offline Mode — Saved Diary & Tank Calculator ready',
    errorTitle: 'Could not check right now',
    errorRetry: 'Try Again',
    micNotSupported: 'Voice mic unavailable here. Please type below.',
    liveTitle: 'KisanVaani Live Voice',
    liveButton: 'Talk Live About Problem',
    liveButtonSub: 'Speak freely like a phone call',
    liveConnecting: 'Connecting live voice...',
    liveListening: 'Listening — speak freely now',
    liveSpeaking: 'KisanVaani is speaking...',
    liveMuted: 'Mic is muted',
    liveMute: 'Mute Mic',
    liveUnmute: 'Unmute Mic',
    liveEndCall: 'End Conversation',
    liveShowPhoto: 'Show Photo',
    livePhotoSent: 'Photo shared with assistant',
    liveTypePlaceholder: 'Or type a message in live chat...',
    liveWelcomeHint: 'Namaste! Just tell me about your crop or spray problem in your own words. I am listening.',
    liveMicDenied: 'Microphone permission unavailable. You can still type below.',
  },
};

export function getLanguageOption(code: LanguageCode): LanguageOption {
  return LANGUAGE_OPTIONS.find((l) => l.code === code) || LANGUAGE_OPTIONS[3];
}
