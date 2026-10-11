'use client';

import { useState, useEffect } from 'react';

export type Language = 'hi' | 'en';

const LANGUAGE_KEY = 'dpswt_language';

export const translations = {
  hi: {
    // Brand & Top banner
    appName: 'DPSWT',
    taglineFull: 'Direct People Support Welfare Team (उत्तर प्रदेश)',
    stateBadge: 'उत्तर प्रदेश',
    zeroCustody: 'Zero-Custody P2P',
    zeroCustodySub: '100% प्रत्यक्ष बैंक अंतरण • नो वॉलेट • नो बिचौलिया',
    zeroCustodyMobile: 'सीधे नामिनी के खाते में ₹50 सहयोग',
    verifiedMembersCount: '1,28,450+ सत्यापित सदस्य',
    understand75Rule: '75% नियम समझें',
    annualRenewalBadge: '₹50 वार्षिक नवीनीकरण',

    // Navigation
    home: 'होम',
    appeals: 'सहयोग सूची',
    rules: '75% नियमावली',
    directory: 'निर्देशिका',
    dashboard: 'डैशबोर्ड',
    inspectorPanel: 'ऑडिट कक्ष',
    contribute50: 'सहयोग करें (₹50)',
    switchRole: 'डेमो प्रोफाइल बदलें',
    activeUser: 'सक्रिय सदस्य',
    live: 'लाइव',
    profile: 'प्रोफाइल',
    audit: 'ऑडिट',
    active: 'सक्रिय',

    // Hero Section
    heroPill: 'Zero-Custody P2P Model • नो वॉलेट • नो मध्यस्थ',
    heroTagline: '“जन से जन तक, सहयोग हर जरूरतमंद तक”',
    heroSubtitle:
      'उत्तर प्रदेश के समर्पित कर्मचारियों एवं नागरिकों का पारस्परिक कल्याण मंच। किसी आकस्मिक आपदा या निधन की दशा में प्रत्येक साथी मात्र ₹50 का सीधा सहयोग भेजकर पीड़ित परिवार को ₹20 लाख तक का सम्मानजनक संबल प्रदान करता है।',
    heroCtaAppeals: 'सक्रिय अपीलें देखें व सहयोग करें',
    heroCtaRules: '75% कल्याण नियमावली',
    heroBadge1: 'आधार एवं सेवा अभिलेख सत्यापित',
    heroBadge2: 'जिला स्तरीय भौतिक निरीक्षण',
    heroBadge3: '₹50 प्रति सदस्य सहयोग चक्र',

    // Live Metrics
    metricsHeading: 'लाइव ऑडिट आंकड़े',
    statMembers: 'सक्रिय सत्यापित सदस्य',
    statMembersSub: 'उत्तर प्रदेश के समस्त 75 जनपद',
    statDisbursed: 'प्रत्यक्ष वितरित सहायता',
    statDisbursedSub: 'नामिनी बैंक खातों में 100% प्रत्यक्ष अंतरण',
    statAppeals: 'पूर्ण शोकाकुल अपीलें',
    statAppealsSub: 'अधिकतम ₹20,00,000 प्रति परिवार',
    statCompliance: 'औसत समुदाय सहभागिता',
    statComplianceSub: '75% न्यूनतम पात्रता मानक से ऊपर',

    // 4 Pillars
    pillarsPill: 'कल्याण मंच की कार्यप्रणाली',
    pillarsTitle: 'DPSWT के 4 पारदर्शी आधार स्तंभ',
    pillarsSubtitle: 'पूर्ण पारदर्शिता, शून्य मध्यस्थता और त्वरित राहत हेतु निर्मित अनूठा मॉडल',
    pillar1Title: '1. Zero-Custody P2P',
    pillar1Desc: 'प्लेटफ़ॉर्म किसी भी सदस्य का धन अपने खाते या एस्क्रो वॉलेट में नहीं रखता। सदस्य एक-दूसरे के नामिनी बैंक खाते व UPI आईडी में सीधे ₹50 अंतरित करते हैं।',
    pillar2Title: '2. 75% अनुपालन इंजन',
    pillar2Desc: 'पारस्परिक सहायता केवल उन्हीं सदस्यों को मिलती है जो समुदाय की कम से कम 75% अपीलों में नियमित भागीदारी निभाते हैं। यह प्रणाली निष्पक्षता सुनिश्चित करती है।',
    pillar3Title: '3. भौतिक निरीक्षण व ऑडिट',
    pillar3Desc: 'जिला स्तरीय सत्यापन प्रकोष्ठ के अधिकारी पीड़ित परिवार के घर जाकर मृत्यु प्रमाण पत्र, सेवा पंजिका व बैंक पासबुक का प्रत्यक्ष मिलान करते हैं।',
    pillar4Title: '4. ₹50 की सामूहिक शक्ति',
    pillar4Desc: 'मात्र एक कप चाय के मूल्य (₹50) में जब 40,000 सदस्य एक साथ खड़े होते हैं, तो बिना किसी आर्थिक बोझ के शोकाकुल परिवार को ₹20,00,000 की ऐतिहासिक मदद मिलती है।',

    // Home Appeals Preview
    homeAppealsPill: 'सहयोग का पुनीत अवसर',
    homeAppealsTitle: 'सक्रिय कल्याण अपीलें (Live Appeals)',
    homeAppealsSub: 'सत्यापित शोकाकुल एवं वैवाहिक सहायता अनुरोध, जिनमें आपका ₹50 सहयोग अपेक्षित है',
    viewAllAppeals: 'सभी अपीलें देखें',
    membersContributed: 'सदस्यों ने योगदान दिया',

    // 75% Simulator
    simTag: 'पारदर्शिता एवं पात्रता कैलकुलेटर',
    simTitle: '75% अनुपालन सिम्युलेटर (Compliance Simulator)',
    simSub: 'स्वयं देखें कि समुदाय में आपकी नियमित ₹50 सहभागिता किस प्रकार आपके परिवार को ₹20 लाख सहायता हेतु पूर्ण पात्र बनाए रखती है।',
    simTotalLabel: 'कुल जारी अपीलें:',
    simContributedLabel: 'आपका ₹50 सहयोग:',
    simAppealsCount: 'अपीलें',
    simEligible: 'कल्याण सहायता हेतु पूर्ण पात्र (Eligible)',
    simEligibleDesc: 'बधाई! आपका अनुपात 75% से अधिक है। आकस्मिक स्थिति में आपका परिवार पूर्ण सहायता प्राप्त करने का अधिकारी है।',
    simCritical: 'अपात्र / ध्यान दें (Below 75%)',
    simCriticalDescPrefix: 'पात्रता प्राप्त करने हेतु आपको कम से कम ',
    simCriticalDescSuffix: ' और अपीलों में ₹50 सहयोग प्रेषित करना होगा।',
    simTotalContributedAmount: 'कुल अंशदान राशि',

    // FAQ Section
    faqPill: 'जिज्ञासा समाधान',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)',
    faq1Q: 'क्या DPSWT किसी वॉलेट में दान का पैसा एकत्र करता है?',
    faq1A: 'बिल्कुल नहीं! DPSWT का मूल सिद्धांत ‘Zero-Custody Peer-to-Peer’ है। जब किसी साथी के साथ आकस्मिक दुर्घटना होती है, तो मंच सीधे उनके सत्यापित नामिनी का बैंक खाता व UPI प्रदर्शित करता है। आप अपना ₹50 सीधे उनके बैंक खाते में भेजते हैं। प्लेटफ़ॉर्म किसी भी प्रकार का कमीशन या कटौता नहीं करता।',
    faq2Q: '75% अनुपालन नियम क्यों बनाया गया है?',
    faq2A: 'पारस्परिक सहयोग की व्यवस्था केवल तभी जीवित रह सकती है जब हर सदस्य दूसरों के संकट में साथ खड़ा हो। यदि कोई केवल अपनी बारी आने पर लाभ लेना चाहे और दूसरों को सहयोग न दे, तो व्यवस्था चरमरा जाएगी। अतः परिवार के संबल की गारंटी हेतु न्यूनतम 75% अपीलों में ₹50 सहयोग अनिवार्य किया गया है।',
    faq3Q: '₹50 वार्षिक नवीनीकरण सदस्यता शुल्क किसलिए है?',
    faq3A: 'यह ₹50 वार्षिक शुल्क सर्वर होस्टिंग, SMS गेटवे, डेटाबेस सुरक्षा एवं जिला सत्यापन अधिकारियों के फील्ड निरीक्षण प्रपत्र मुद्रण जैसे आवश्यक तकनीकी व प्रशासनिक खर्चों के संचालन हेतु लिया जाता है।',
    faq4Q: 'भुगतान के बाद 12-अंक UTR दर्ज करना क्यों आवश्यक है?',
    faq4A: 'चूंकि प्लेटफ़ॉर्म में कोई बैंक गेटवे सीधे बीच में नहीं है, इसलिए जिला सत्यापन दल नामिनी के पासबुक स्टेटमेंट से आपके 12-अंकीय UTR नंबर का भौतिक मिलान करता है। UTR दर्ज करने के बाद ही आपका 75% अनुपालन रिकॉर्ड सत्यापित होता है।',

    // CTA Banner
    joinFamilyTitle: 'आज ही DPSWT परिवार का हिस्सा बनें',
    joinFamilyDesc: 'आधार कार्ड एवं विभागीय पहचान के साथ सरल 2-मिनट पंजीकरण। अपने परिवार की सुरक्षा सुनिश्चित करें और जरूरतमंद साथियों के संबल बनें।',
    registerBtn: 'नया सदस्य पंजीकरण (₹50 Annual)',
    exploreAppealsBtn: 'सक्रिय अपीलें देखें',

    // Appeals Feed Page
    appealsPill: 'सामुदायिक सहभागिता',
    appealsHeader: 'सहयोग सूची (Active Appeals Feed)',
    appealsSub: 'प्रत्येक सत्यापित अपील में मात्र ₹50 का सीधा सहयोग प्रेषित कर पीड़ित परिवार को संबल प्रदान करें',
    newAppealCta: 'नई आपात अपील दर्ज करें',
    allTypes: 'सभी प्रकार',
    bereavementType: 'आकस्मिक निधन (₹20L)',
    marriageType: 'पुत्री विवाह संबल',
    activeOnly: 'सक्रिय अपीलें',
    closedOnly: 'पूर्ण',
    allStatuses: 'समस्त',
    searchPlaceholder: 'अपील कोड (उदा. B081), नाम, जनपद या नामिनी खोजें...',
    receivedAid: 'प्राप्त सहयोग:',
    targetGoal: 'लक्ष्य:',
    progress: 'प्रगति:',
    verifiedNominee: 'सत्यापित नामिनी:',
    bankAndBranch: 'बैंक व शाखा:',
    upiIdLabel: 'UPI आईडी:',
    send50Upi: 'सीधे ₹50 भेजें (UPI)',
    uploadSlip: 'रसीद अपलोड',
    caseDetails: 'केस विवरण →',
    closedNotice: 'लक्ष्य शत-प्रतिशत पूर्ण हो चुका है',
    noAppealsFound: 'कोई अपील नहीं मिली। कृपया फ़िल्टर अथवा खोज शब्द बदलें।',

    // Appeal Detail Page
    backToAppeals: 'सभी अपीलों पर वापस जाएं',
    caseBackground: 'केस पृष्ठभूमि एवं परिवार की स्थिति',
    inspectorSignedReport: 'जिला सत्यापन प्रकोष्ठ की हस्ताक्षरित रिपोर्ट',
    liveAuditLog: 'पारदर्शी सहयोग ऑडिट लॉग (Live Audit Feed)',
    donorCol: 'दानदाता',
    utrCol: '12-अंक UTR',
    amountCol: 'राशि',
    statusCol: 'स्थिति',
    dateCol: 'दिनांक',
    nomineeAccountTitle: 'नामिनी का बैंक खाता',
    nomineeAccountDesc: 'धन सीधे नामिनी के खाते में जाएगा, किसी बिचौलिए या वॉलेट में नहीं।',
    openUpiApp: 'UPI ऐप से ₹50 भेजें',
    scanQrCodeDesc: 'डेस्कटॉप स्क्रीन से किसी भी UPI ऐप द्वारा स्कैन करें',
    nomineeNameLabel: 'नामिनी का नाम:',
    bankNameLabel: 'बैंक का नाम:',
    accountNumberLabel: 'खाता संख्या:',
    ifscLabel: 'IFSC कोड:',
    submitSlipButton: '₹50 भुगतान के बाद रसीद व UTR दर्ज करें',
    copiedText: 'कॉपी हो गया!',
    copyText: 'कॉपी करें',
    inspectionVerifiedOn: 'सत्यापन तिथि:',
    inspectorOfficial: 'सत्यापन अधिकारी:',

    // Create Appeal Page
    createAppealPill: 'आपातकालीन सहायता अनुरोध',
    createAppealTitle: 'आपातकालीन सहयोग आवेदन',
    createAppealSub: 'आकस्मिक निधन अथवा पुत्री विवाह सहायता हेतु संगठन के सत्यापन प्रकोष्ठ को आवेदन प्रेषित करें।',
    aidCategory: 'सहयोग का प्रकार (Aid Category) *',
    bereavementTitle: 'आकस्मिक निधन संबल',
    bereavementGoal: '₹20,00,000 (₹20 लाख)',
    bereavementDesc: 'सेवारत अथवा पंजीकृत सदस्य के असामयिक निधन की दशा में आश्रित परिवार को',
    marriageTitle: 'पुत्री वैवाहिक संबल',
    marriageGoal: '₹5,00,000 (₹5 लाख)',
    marriageDesc: 'कर्मठ सदस्य की पुत्री के विवाह हेतु समुदाय द्वारा सामूहिक उपहार संबल',
    deceasedOrBeneficiaryName: 'दिवंगत सदस्य / कन्या का नाम *',
    eventDateLabel: 'घटना / विवाह दिनांक *',
    caseDescriptionLabel: 'घटना, पद, विभाग एवं परिवार की स्थिति का विवरण *',
    nomineeDetailsHeader: 'सत्यापित नामिनी बैंक व UPI विवरण (Zero-Custody) *',
    relationshipLabel: 'सदस्य से संबंध (Relationship) *',
    submitAppealAction: 'अपील दर्ज करें व लाइव सहयोग प्रारंभ करें',
    cancel: 'रद्द करें',

    // Dashboard Page
    dashboardPill: 'सदस्य प्रोफ़ाइल व अभिलेख',
    digitalIdCard: 'डिजिटल सदस्यता पहचान पत्र',
    membershipIdLabel: 'सदस्यता क्रमांक:',
    aadhaarVerificationLabel: 'आधार सत्यापन:',
    departmentLabel: 'कार्यरत विभाग:',
    districtStateLabel: 'गृह जनपद व राज्य:',
    phoneLabel: 'पंजीकृत मोबाइल:',
    pendingAppealsAlert: 'शेष सक्रिय अपीलें — तत्काल ₹50 सहयोग प्रेषित करें',
    contributionHistoryTitle: 'आपके द्वारा समर्थित अपीलों का इतिहास',
    annualRenewalLabel: 'वार्षिक सदस्यता शुल्क:',
    daysRemaining: 'दिन शेष',
    complianceMeterTitle: '75% अनुपालन मीटर',
    ratioLabel: 'अनुपालन अनुपात:',
    eligibleBadge: 'पात्र (Eligible)',
    criticalBadge: 'अपात्र (Below 75%)',
    quickContribute: '₹50 भेजें',

    // Inspector Audit Panel
    inspectorPill: 'जिला सत्यापन प्रकोष्ठ',
    inspectorTitle: 'सत्यापन अधिकारी ऑडिट कक्ष (Inspector Panel)',
    inspectorSub: 'नामिनी पासबुक स्टेटमेंट से सदस्यों द्वारा प्रेषित 12-अंकीय UTR नंबर एवं रसीद का भौतिक सत्यापन',
    filterByStatus: 'स्थिति अनुसार फ़िल्टर:',
    pendingAudit: 'लंबित सत्यापन (Submitted)',
    verifiedAudits: 'सत्यापित (Verified)',
    rejectedAudits: 'अस्वीकृत (Rejected)',
    searchUtrPlaceholder: '12-अंक UTR अथवा सदस्य नाम खोजें...',
    verifyAction: 'सत्यापित करें',
    rejectAction: 'अस्वीकृत करें',
    viewSlipAction: 'रसीद देखें',
    passbookMatchingTitle: 'नामिनी पासबुक मिलान',

    // Rules Page
    rulesPill: 'डीपीएसडब्ल्यूटी पारस्परिक कल्याण नियमावली 2026',
    rulesTitle: 'नियम, दिशानिर्देश एवं 75% अनुपालन संहिता',
    rulesSub: 'पारस्परिक सहयोग की पवित्रता, निष्पक्षता और शोकाकुल परिवारों को अधिकतम सुरक्षा प्रदान करने हेतु निर्धारित वैधानिक नियम एवं पात्रता शर्तें',
    goldenRatioTitle: '75% सहभागिता का स्वर्णिम नियम (Golden Ratio Rule)',
    goldenRatioSub: 'कल्याण सहायता प्राप्त करने की अनिवार्य एवं अहस्तांतरणीय पूर्व-शर्त',
    ruleFormulaTitle: 'गणितीय सूत्र (Compliance Formula):',
    ruleFormulaEquation: 'अनुपालन अनुपात (%) = (आपके द्वारा समर्थित अपीलें ÷ कुल ऐतिहासिक अपीलें) × 100',
    ruleFormulaNote: 'यदि यह अनुपात 75% या उससे अधिक है, तो सदस्य परिवार स्वतः पूर्ण कल्याण सहायता हेतु पात्र माना जाता है।',

    // Directory / Contact Page
    directoryPill: 'जिला समन्वय समिति',
    directoryTitle: 'जनपद समन्वयक निर्देशिका व संपर्क',
    directorySub: 'उत्तर प्रदेश के समस्त 75 जनपदों में तैनात अधिकृत जिला समन्वयक एवं सहायता प्रकोष्ठ',
    searchDistrictPlaceholder: 'जनपद या समन्वयक का नाम खोजें...',
    grievanceTitle: 'शिकायत निवारण एवं पूछताछ फॉर्म',
    grievanceSub: 'तकनीकी समस्या, UTR मिलान अथवा सदस्यता संबंधी सहायता हेतु संदेश प्रेषित करें',
    sendMessageAction: 'संदेश प्रेषित करें',

    // Footer
    footerMission: 'डीपीएसडब्ल्यूटी उत्तर प्रदेश के विभिन्न विभागों के कर्मचारियों एवं नागरिकों का एक गैर-लाभकारी, आपसी सहयोग आधारित कल्याणकारी परिवार है। यहां आपात स्थिति में प्रत्येक सदस्य सीधे नामिनी के खाते में मात्र ₹50 का अंशदान देकर शोकाकुल परिवार को ₹20 लाख तक का जीवन संबल प्रदान करता है।',
    quickLinksHeading: 'महत्वपूर्ण पृष्ठ (Quick Links)',
    complianceCheckHeading: 'कल्याण मानक (Compliance)',
    helplineHeading: 'हेल्पलाइन व संपर्क (Helpline)',
    legalNoticeHeading: 'वैधानिक एवं पारदर्शी घोषणा (Zero-Custody Legal Notice):',
    legalNoticeBody: 'डीपीएसडब्ल्यूटी (DPSWT) कोई वित्तीय संस्थान, बैंक, बीमा कंपनी, एनबीएफसी अथवा क्राउडफंडिंग एस्क्रो प्लेटफॉर्म नहीं है। इस वेबसाइट का संचालन केवल पारस्परिक सहयोग के डेटा समन्वय एवं सत्यापन हेतु किया जाता है। किसी भी अपील की सहयोग राशि प्लेटफ़ॉर्म अथवा प्रबंधकों के खाते में नहीं ली जाती, बल्कि सीधे पीड़ित सदस्य के सत्यापित नामिनी के बैंक खाते/UPI में जाती है।',
    copyright: 'DPSWT (Direct People Support Welfare Team). सर्वाधिकार सुरक्षित।',
    privacyPolicy: 'गोपनीयता नीति',
    termsConditions: 'नियम व शर्तें',
    grievanceCell: 'शिकायत निवारण',
    allCoordinatorsLink: 'सभी 75 जनपदों के समन्वयक देखें',

    // Modals
    upiModalTitle: 'सीधा ₹50 UPI सहयोग (Zero-Custody)',
    upiModalSub: 'धनराशि सीधे नामिनी के अधिकृत बैंक खाते में जाएगी',
    scanQrTitle: 'QR कोड स्कैन करें',
    mobileUpiTitle: 'मोबाइल UPI ऐप से भुगतान करें',
    alreadyPaidBtn: 'भुगतान पूर्ण कर लिया? 12-अंक UTR दर्ज करें →',
    slipModalTitle: 'भुगतान रसीद एवं 12-अंक UTR सत्यापन',
    slipModalSub: 'नामिनी पासबुक मिलान हेतु UTR एवं स्क्रीनशॉट अपलोड करें',
    utrInputLabel: '12-अंकीय बैंक UTR / UPI संदर्भ संख्या *',
    slipUploadLabel: 'भुगतान रसीद / स्क्रीनशॉट (PNG, JPG) *',
    confirmSlipBtn: 'सत्यापन हेतु जमा करें (₹50 Verified)',

    // Language toggle
    languageToggle: 'English',
  },

  en: {
    // Brand & Top banner
    appName: 'DPSWT',
    taglineFull: 'Direct People Support Welfare Team (Uttar Pradesh)',
    stateBadge: 'Uttar Pradesh',
    zeroCustody: 'Zero-Custody P2P',
    zeroCustodySub: '100% Direct Bank Transfer • No Escrow Wallet • No Intermediary',
    zeroCustodyMobile: 'Direct ₹50 to Nominee Account',
    verifiedMembersCount: '128,450+ Verified Members',
    understand75Rule: 'Understand 75% Rule',
    annualRenewalBadge: '₹50 Annual Renewal',

    // Navigation
    home: 'Home',
    appeals: 'Appeals',
    rules: '75% Rules',
    directory: 'Directory',
    dashboard: 'Dashboard',
    inspectorPanel: 'Audit Panel',
    contribute50: 'Contribute (₹50)',
    switchRole: 'Switch Demo Role',
    activeUser: 'Active Member',
    live: 'LIVE',
    profile: 'Profile',
    audit: 'Audit',
    active: 'Active',

    // Hero Section
    heroPill: 'Zero-Custody P2P Model • No Escrow Wallet • 100% Direct Transfer',
    heroTagline: '“People to People, Aid to Every Family in Need”',
    heroSubtitle:
      'Mutual welfare solidarity platform for public sector employees and citizens in Uttar Pradesh. During bereavement or emergency life events, each member transfers ₹50 directly into the nominee bank account, delivering up to ₹20 Lakhs in total dignified family relief.',
    heroCtaAppeals: 'Explore Appeals & Contribute',
    heroCtaRules: '75% Compliance Rules',
    heroBadge1: 'Aadhaar & Service Records Verified',
    heroBadge2: 'District Level Physical Inspection',
    heroBadge3: '₹50 Micro-Philanthropy Cycle',

    // Live Metrics
    metricsHeading: 'Live Transparency Metrics',
    statMembers: 'Active Verified Members',
    statMembersSub: 'Across all 75 Districts of Uttar Pradesh',
    statDisbursed: 'Direct Aid Disbursed',
    statDisbursedSub: '100% Direct transfers into nominee bank accounts',
    statAppeals: 'Completed Relief Appeals',
    statAppealsSub: 'Up to ₹20,00,000 per bereaved family',
    statCompliance: 'Avg Community Compliance',
    statComplianceSub: 'Well above the 75% minimum eligibility requirement',

    // 4 Pillars
    pillarsPill: 'Platform Operational Model',
    pillarsTitle: 'The 4 Core Pillars of DPSWT',
    pillarsSubtitle: 'Designed for absolute transparency, zero escrow custody, and rapid community relief',
    pillar1Title: '1. Zero-Custody P2P',
    pillar1Desc: 'The platform never holds member donation capital in an escrow wallet. Contributing members transfer ₹50 directly into verified nominee bank accounts and UPI IDs.',
    pillar2Title: '2. 75% Compliance Engine',
    pillar2Desc: 'Mutual family aid is reserved for members who maintain a minimum 75% participation rate in historical community appeals, ensuring mutual fairness and preventing free-riding.',
    pillar3Title: '3. Physical Field Audits',
    pillar3Desc: 'District inspection cell nodal officers visit the family, verifying death certificates, hospital records, and matching bank passbook statements in person.',
    pillar4Title: '4. The Power of ₹50',
    pillar4Desc: 'At just the cost of a cup of tea (₹50), when 40,000 members stand united, ₹20,00,000 in life-changing support is delivered without financial burden.',

    // Home Appeals Preview
    homeAppealsPill: 'Sacred Opportunity to Support',
    homeAppealsTitle: 'Active Welfare Appeals (Live Appeals)',
    homeAppealsSub: 'Verified bereavement and marriage assistance requests awaiting your ₹50 contribution',
    viewAllAppeals: 'View All Appeals',
    membersContributed: 'members contributed',

    // 75% Simulator
    simTag: 'Transparency & Eligibility Calculator',
    simTitle: '75% Compliance Simulator',
    simSub: 'See how your regular ₹50 contributions dynamically keep your family eligible for ₹20 Lakhs in emergency bereavement grants.',
    simTotalLabel: 'Total Issued Appeals:',
    simContributedLabel: 'Your ₹50 Contributions:',
    simAppealsCount: 'appeals',
    simEligible: 'Fully Eligible for Welfare Aid (≥ 75%)',
    simEligibleDesc: 'Congratulations! Your ratio is 75% or higher. In any emergency event, your family is guaranteed full community aid.',
    simCritical: 'Critical: Ineligible (Below 75%)',
    simCriticalDescPrefix: 'To restore eligibility, you need to contribute ₹50 to at least ',
    simCriticalDescSuffix: ' more community appeals.',
    simTotalContributedAmount: 'Total Amount Contributed',

    // FAQ Section
    faqPill: 'Frequently Answered',
    faqTitle: 'Frequently Asked Questions (FAQ)',
    faq1Q: 'Does DPSWT hold donation money in any escrow wallet or pool?',
    faq1A: 'Absolutely not! The cornerstone of DPSWT is Zero-Custody Peer-to-Peer transfer. When an emergency happens, the platform exposes the verified nominee’s direct bank account and UPI QR code. Your ₹50 goes straight into the beneficiary’s account without platform cuts or custody.',
    faq2Q: 'Why is the 75% compliance participation rule enforced?',
    faq2A: 'Mutual welfare solidarity functions only when members consistently support others in their hour of grief. If individuals join only to claim benefits without contributing, the system collapses. Hence, a minimum 75% participation threshold is required to guarantee family protection.',
    faq3Q: 'What is the purpose of the ₹50 annual renewal fee?',
    faq3A: 'The ₹50 annual subscription covers essential technology and operational costs: high-availability cloud servers, database security, SMS gateway verification, and field inspection audit travel.',
    faq4Q: 'Why must I submit the 12-digit UTR reference after payment?',
    faq4A: 'Because no payment gateway intermediary touches your money, district field inspectors audit the nominee’s physical bank passbook against your unique 12-digit UTR number to verify and credit your compliance score.',

    // CTA Banner
    joinFamilyTitle: 'Become Part of the DPSWT Family Today',
    joinFamilyDesc: 'Simple 2-minute registration with Aadhaar and departmental credentials. Protect your family while empowering brethren across Uttar Pradesh.',
    registerBtn: 'New Member Registration (₹50 Annual)',
    exploreAppealsBtn: 'Explore Active Appeals',

    // Appeals Feed Page
    appealsPill: 'Community Solidarity',
    appealsHeader: 'Active Appeals Feed',
    appealsSub: 'Transfer ₹50 directly to the verified nominee to provide life-saving community support',
    newAppealCta: 'Submit Emergency Appeal',
    allTypes: 'All Categories',
    bereavementType: 'Bereavement (₹20L)',
    marriageType: 'Daughter Marriage',
    activeOnly: 'Active Appeals',
    closedOnly: 'Completed',
    allStatuses: 'All Records',
    searchPlaceholder: 'Search appeal code (e.g. B081), name, district, or nominee...',
    receivedAid: 'Collected Aid:',
    targetGoal: 'Target Goal:',
    progress: 'Progress:',
    verifiedNominee: 'Verified Nominee:',
    bankAndBranch: 'Bank & Branch:',
    upiIdLabel: 'UPI ID:',
    send50Upi: 'Send ₹50 (UPI)',
    uploadSlip: 'Upload Slip',
    caseDetails: 'Case Details →',
    closedNotice: 'Target 100% Completed & Verified',
    noAppealsFound: 'No appeals found matching your current filter criteria.',

    // Appeal Detail Page
    backToAppeals: 'Back to all appeals',
    caseBackground: 'Case Background & Family Circumstances',
    inspectorSignedReport: 'Signed District Field Inspector Verification Report',
    liveAuditLog: 'Transparent Contribution Audit Feed',
    donorCol: 'Donor Member',
    utrCol: '12-Digit UTR',
    amountCol: 'Amount',
    statusCol: 'Status',
    dateCol: 'Date',
    nomineeAccountTitle: 'Nominee Bank Account',
    nomineeAccountDesc: 'Funds are transferred directly into the nominee account without intermediary wallet holding.',
    openUpiApp: 'Send ₹50 via UPI App',
    scanQrCodeDesc: 'Scan with any UPI app on desktop (PhonePe, GPay, Paytm, BHIM)',
    nomineeNameLabel: 'Nominee Name:',
    bankNameLabel: 'Bank Name:',
    accountNumberLabel: 'Account Number:',
    ifscLabel: 'IFSC Code:',
    submitSlipButton: 'Record 12-Digit UTR & Slip After Payment',
    copiedText: 'Copied!',
    copyText: 'Copy',
    inspectionVerifiedOn: 'Verification Date:',
    inspectorOfficial: 'Inspector In-Charge:',

    // Create Appeal Page
    createAppealPill: 'Emergency Relief Application',
    createAppealTitle: 'Submit Emergency Welfare Appeal',
    createAppealSub: 'Submit an emergency bereavement or marriage assistance appeal to the district verification cell.',
    aidCategory: 'Aid Category *',
    bereavementTitle: 'Bereavement Aid',
    bereavementGoal: '₹20,00,000 (₹20 Lakhs)',
    bereavementDesc: 'In the untimely demise of a serving or registered member, grant to the surviving family',
    marriageTitle: "Daughter's Marriage Assistance",
    marriageGoal: '₹5,00,000 (₹5 Lakhs)',
    marriageDesc: "Collective community gift grant for the marriage of a committed member's daughter",
    deceasedOrBeneficiaryName: 'Deceased Member / Beneficiary Name *',
    eventDateLabel: 'Event Date *',
    caseDescriptionLabel: 'Circumstances, Department & Family Background *',
    nomineeDetailsHeader: 'Verified Nominee Direct Bank & UPI Credentials *',
    relationshipLabel: 'Relationship to Member *',
    submitAppealAction: 'Submit Appeal & Activate Community Contributions',
    cancel: 'Cancel',

    // Dashboard Page
    dashboardPill: 'Member Profile & Records',
    digitalIdCard: 'Digital Membership ID Card',
    membershipIdLabel: 'Membership ID:',
    aadhaarVerificationLabel: 'Aadhaar Verification:',
    departmentLabel: 'Department:',
    districtStateLabel: 'District & State:',
    phoneLabel: 'Registered Mobile:',
    pendingAppealsAlert: 'Pending Active Appeals — Contribute ₹50 to Protect Eligibility',
    contributionHistoryTitle: 'Your Contribution History',
    annualRenewalLabel: 'Annual Membership Fee:',
    daysRemaining: 'days remaining',
    complianceMeterTitle: '75% Compliance Gauge',
    ratioLabel: 'Compliance Ratio:',
    eligibleBadge: 'Eligible (≥ 75%)',
    criticalBadge: 'Critical (Below 75%)',
    quickContribute: 'Send ₹50',

    // Inspector Audit Panel
    inspectorPill: 'District Verification Cell',
    inspectorTitle: 'Field Inspector Audit Panel',
    inspectorSub: 'Physical verification of 12-digit UTR numbers and receipt slips against nominee bank passbook records',
    filterByStatus: 'Filter by Status:',
    pendingAudit: 'Pending Verification (Submitted)',
    verifiedAudits: 'Verified Records',
    rejectedAudits: 'Rejected Records',
    searchUtrPlaceholder: 'Search 12-digit UTR or Member name...',
    verifyAction: 'Verify & Credit',
    rejectAction: 'Reject Submission',
    viewSlipAction: 'View Slip',
    passbookMatchingTitle: 'Nominee Passbook Statement Match',

    // Rules Page
    rulesPill: 'DPSWT Mutual Welfare Code 2026',
    rulesTitle: 'Rules, Guidelines & 75% Compliance Code',
    rulesSub: 'Statutory requirements and eligibility standards established to ensure fairness and maximum protection for bereaved families',
    goldenRatioTitle: 'The 75% Golden Ratio Rule',
    goldenRatioSub: 'Mandatory non-negotiable prerequisite for receiving community welfare assistance',
    ruleFormulaTitle: 'Compliance Formula:',
    ruleFormulaEquation: 'Compliance Ratio (%) = (Appeals Supported ÷ Total Historical Appeals) × 100',
    ruleFormulaNote: 'If this ratio is 75% or higher, the member family is automatically certified fully eligible for welfare aid.',

    // Directory / Contact Page
    directoryPill: 'District Coordination Council',
    directoryTitle: 'District Coordinators & Helpdesk',
    directorySub: 'Authorized district coordinators and support cells deployed across all 75 districts of Uttar Pradesh',
    searchDistrictPlaceholder: 'Search district or coordinator name...',
    grievanceTitle: 'Grievance Redressal & Inquiry Form',
    grievanceSub: 'Submit an inquiry regarding technical support, UTR matching, or membership assistance',
    sendMessageAction: 'Submit Message',

    // Footer
    footerMission: 'DPSWT is a non-profit, mutual solidarity welfare community of government employees and citizens across Uttar Pradesh. In emergencies, each member contributes ₹50 directly into the nominee bank account, providing up to ₹20 Lakhs in life-saving relief.',
    quickLinksHeading: 'Quick Links',
    complianceCheckHeading: 'Compliance Standards',
    helplineHeading: 'Helpline & Support',
    legalNoticeHeading: 'Zero-Custody Legal Notice:',
    legalNoticeBody: 'DPSWT is not a bank, insurance entity, NBFC, or escrow crowdfunding platform. This website coordinates mutual community data and field verification only. No donation capital is accepted or held by the platform; all contributions flow directly from member to nominee bank/UPI.',
    copyright: 'DPSWT (Direct People Support Welfare Team). All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',
    grievanceCell: 'Grievance Cell',
    allCoordinatorsLink: 'View Coordinators in All 75 Districts',

    // Modals
    upiModalTitle: 'Direct ₹50 UPI Contribution (Zero-Custody)',
    upiModalSub: 'Funds are transferred directly into the verified nominee bank account',
    scanQrTitle: 'Scan Dynamic QR Code',
    mobileUpiTitle: 'Pay with Mobile UPI App',
    alreadyPaidBtn: 'Already Paid? Enter 12-Digit UTR →',
    slipModalTitle: 'Payment Receipt & 12-Digit UTR Verification',
    slipModalSub: 'Upload screenshot and UTR number for nominee passbook statement audit',
    utrInputLabel: '12-Digit Bank UTR / UPI Reference Number *',
    slipUploadLabel: 'Payment Screenshot Receipt (PNG, JPG) *',
    confirmSlipBtn: 'Submit for Audit Verification (₹50 Verified)',

    // Language toggle
    languageToggle: 'हिन्दी',
  },
};

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'hi';
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language;
    return saved === 'en' ? 'en' : 'hi';
  } catch {
    return 'hi';
  }
}

export function useTranslation() {
  const [lang, setLang] = useState<Language>('hi');

  useEffect(() => {
    setLang(getInitialLanguage());

    const handler = () => {
      setLang(getInitialLanguage());
    };
    window.addEventListener('dpswt_lang_change', handler);
    return () => window.removeEventListener('dpswt_lang_change', handler);
  }, []);

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'hi' ? 'en' : 'hi';
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_KEY, nextLang);
      window.dispatchEvent(new Event('dpswt_lang_change'));
    }
    setLang(nextLang);
  };

  return {
    lang,
    t: translations[lang],
    toggleLanguage,
  };
}
