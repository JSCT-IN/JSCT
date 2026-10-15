'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import {
  BookOpen,
  Scale,
  ShieldCheck,
  Search,
  ChevronDown,
  Printer,
  Sparkles,
  Users,
  HeartHandshake,
  Heart,
  AlertTriangle,
  FileText,
  Clock,
  PhoneCall,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';

interface RuleSection {
  id: string;
  number: string;
  titleHi: string;
  titleEn: string;
  icon: any;
  category: string;
  summaryHi: string;
  summaryEn: string;
  clausesHi: string[];
  clausesEn: string[];
  criticalAlertHi?: string;
  criticalAlertEn?: string;
}

export default function NiyamawaliPage() {
  const { lang, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'sec-intro': true,
    'sec-1': true,
    'sec-3': true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    sections.forEach((s) => (all[s.id] = true));
    setOpenSections(all);
  };

  const collapseAll = () => {
    setOpenSections({});
  };

  // 12 Complete Constitution Sections (Based on official trust rules adapted for Jan Sewa Charitable Trust)
  const sections: RuleSection[] = [
    {
      id: 'sec-intro',
      number: 'संस्था परिचय',
      titleHi: 'जन सेवा चैरिटेबल ट्रस्ट (JSCT) — परिचय एवं ध्येय',
      titleEn: 'About Jan Sewa Charitable Trust (JSCT) & Core Mission',
      icon: HeartHandshake,
      category: 'ABOUT',
      summaryHi: 'बिना भेदभाव, बिना बिचौलियों और बिना देरी के 100% प्रत्यक्ष सहायता उपलब्ध कराने का समावेशी कल्याण मंच।',
      summaryEn: 'An inclusive peer-to-peer welfare platform delivering 100% direct, zero-delay aid without intermediaries.',
      clausesHi: [
        'जन सेवा चैरिटेबल ट्रस्ट (JSCT) की स्थापना समाज के उन सभी नागरिकों व परिवारों के कल्याण हेतु की गई है, जो किसी भी संकट या आपदा की घड़ी में त्वरित आर्थिक, शैक्षिक एवं सामाजिक सहायता के अभाव में असहाय हो जाते हैं।',
        'हम सभी के मन में सहयोग की पवित्र भावना होते हुए भी जटिल प्रक्रियाओं और औपचारिकताओं के कारण समय पर जरूरतमंद तक सहायता नहीं पहुँच पाती। इस बाधा को दूर करने के लिए JSCT का पारदर्शी ढांचा तैयार किया गया है।',
        'JSCT किसी पद, वर्ग, जाति या पेशे की सीमाओं में बंधे बिना विशुद्ध मानवीय संवेदना, समानता और सामाजिक उत्तरदायित्व के आधार पर कार्य करता है।',
        'संगठन का दृढ़ विश्वास है कि वास्तविक सहायता वही है जो बिना किसी भेदभाव, बिना बिचौलियों और बिना किसी अनुचित विलंब के सीधे पीड़ित परिवार के बैंक खाते में सही समय पर पहुँचे।',
        'यह संस्था केवल एक संगठन नहीं, बल्कि परस्पर विश्वास, सेवा और सम्मान पर आधारित एक जीवंत सामाजिक संबल विचारधारा है।',
        'संगठन का सर्वोच्च ध्येय वाक्य: “जन से जन तक, सहयोग हर जरूरतमंद तक।”'
      ],
      clausesEn: [
        'Jan Sewa Charitable Trust (JSCT) was founded to support all citizens and families who find themselves helpless during crises due to lack of immediate financial and social assistance.',
        'Despite good intentions, complex bureaucracy often delays aid. JSCT overcomes this through a direct, transparent peer-to-peer solidarity system.',
        'JSCT operates without discrimination of rank, profession, caste, or background, driven purely by humanitarian compassion, equality, and social responsibility.',
        'The trust firmly believes true assistance is that which reaches the beneficiary without middlemen, bias, or delays directly into verified bank accounts.',
        'JSCT is a collective movement of mutual trust, honor, and continuous communal solidarity.',
        'Core Motto: “From People to People, Mutual Support to Every Needy Family.”'
      ],
    },
    {
      id: 'sec-1',
      number: 'नियम 1',
      titleHi: 'सदस्यता नियम एवं पात्रता',
      titleEn: 'Membership Rules & Eligibility',
      icon: Users,
      category: 'MEMBERSHIP',
      summaryHi: '18 वर्ष से अधिक आयु के सभी भारतीय नागरिक एवं समस्त विभागों के कर्मचारी ऑनलाइन पोर्टल से सदस्य बन सकते हैं।',
      summaryEn: 'Any Indian citizen aged 18+ and employees across all public & private sectors can register online.',
      clausesHi: [
        '1(1). भारत के प्रत्येक नागरिक जो न्यूनतम 18 वर्ष की आयु पूर्ण कर चुके हैं, संस्था की सदस्यता ग्रहण कर सकते हैं। आयु की गणना आवेदनकर्ता की जन्मतिथि से की जाएगी। सत्यापन हेतु आधार कार्ड, हाईस्कूल अंकपत्र अथवा जन्म प्रमाण पत्र मान्य होगा।',
        '1(2). संगठन में शिक्षा विभाग (उच्च, माध्यमिक एवं बेसिक शिक्षा), शिक्षामित्र, अनुदेशक, स्वास्थ्य विभाग, पंचायत विभाग, सफाई कर्मचारी, सिंचाई विभाग, जल निगम, राजस्व विभाग, ग्राम्य विकास अभिकरण, परिवहन विभाग, रेल विभाग, बाल विकास एवं पुष्टाहार, विद्युत विभाग, बैंक, पुलिस, होमगार्ड, कलेक्ट्रेट, वित्तविहीन विद्यालयों/महाविद्यालयों/मदरसों के शिक्षक व कर्मचारी, प्राइवेट सेक्टर में कार्यरत कार्मिक, अधिवक्ता (एडवोकेट), मीडियाकर्मी, डॉक्टर, इंजीनियर, नर्स, किसान, मजदूर, व्यवसाई, कारीगर, गृहिणी तथा छात्र-छात्राएं सहित अन्य सभी विभागों के सरकारी, संविदा व आउटसोर्सिंग कार्मिक सदस्यता ग्रहण कर सकते हैं।',
        '1(3). सदस्यता शुल्क न्यूनतम ₹50 वार्षिक रहेगा, जो संस्था के आधिकारिक बैंक खाते में दान स्वरूप देय होगा।',
        '1(4). सदस्यता, सदस्यता ग्रहण करने की तिथि से ठीक 01 वर्ष (365 दिन) के लिए मान्य रहेगी।',
        '1(5). सदस्यता ग्रहण तिथि से एक वर्ष पूर्ण होने के उपरांत अधिकतम 30 दिनों के भीतर वार्षिक सदस्यता शुल्क जमा करके नवीनीकरण कराना अनिवार्य होगा। निर्धारित 30 दिनों में नवीनीकरण न होने पर सदस्यता स्वतः निष्क्रिय हो जाएगी।',
        '1(6). सदस्यता के लिए आवेदन सिर्फ और सिर्फ संस्था की आधिकारिक वेबसाइट के माध्यम से ऑनलाइन ही स्वीकार्य होगा। किसी भी प्रकार का ऑफलाइन या बिचौलिया आवेदन अमान्य होगा।'
      ],
      clausesEn: [
        '1(1). Any Indian citizen who has completed 18 years of age can enroll. Verification is conducted via Aadhaar, high school matriculation certificate, or official birth certificate.',
        '1(2). Open across all sectors: Education, Health, Panchayat, Sanitation, Revenue, Irrigation, Police, Transport, Railways, Electricity, Banking, Lawyers, Doctors, Media, Farmers, Workers, and Self-Employed.',
        '1(3). Annual membership donation is nominal: ₹50 per year paid directly to the registered trust account.',
        '1(4). Membership remains valid for 1 year from the date of official enrollment.',
        '1(5). Annual renewal must be completed within a grace period of 30 days upon completion of 1 year.',
        '1(6). Applications are strictly accepted via the official online web portal. No physical/third-party forms are recognized.'
      ],
      criticalAlertHi: 'महत्वपूर्ण: 1 वर्ष पूर्ण होने पर अधिकतम 30 दिनों के भीतर ₹50 वार्षिक नवीनीकरण न कराने पर सदस्यता व पूर्व सहयोग पात्रता शून्य हो सकती है।',
      criticalAlertEn: 'Mandatory: Annual renewal within 30 days is compulsory to retain continuous welfare eligibility.',
    },
    {
      id: 'sec-2',
      number: 'नियम 2',
      titleHi: 'परिवारिक सदस्यता परिभाषा',
      titleEn: 'Family Membership Scope',
      icon: ShieldCheck,
      category: 'MEMBERSHIP',
      summaryHi: 'पति या पत्नी में से किसी एक के सदस्य होने पर पूरा परिवार पारस्परिक सुरक्षा चक्र में शामिल होता है।',
      summaryEn: 'If either spouse is an enrolled member, the immediate family unit is embraced under solidarity coverage.',
      clausesHi: [
        'यदि पति या पत्नी में से कोई एक संस्था का पंजीकृत सदस्य है, तो परिवारिक सदस्यता निम्नानुसार प्रभावी होगी:',
        '2(1). पति के पंजीकृत सदस्य होने की स्थिति में: उनकी वैध पत्नी एवं अविवाहित जैविक बच्चे परिवारिक दायरे में शामिल होंगे।',
        '2(2). पत्नी के पंजीकृत सदस्य होने की स्थिति में: उनके पति एवं अविवाहित जैविक बच्चे परिवारिक दायरे में शामिल होंगे।',
        '2(3). परिवारिक सदस्यता में पति-पत्नी में से केवल उन्हीं की सदस्यता समाप्त मानी जाएगी जो नियम 2 के अंतर्गत नियमों का उल्लंघन करते हैं।'
      ],
      clausesEn: [
        'If either husband or wife is a registered member of JSCT, family coverage applies:',
        '2(1). If husband is registered: Wife and unmarried biological children are covered.',
        '2(2). If wife is registered: Husband and unmarried biological children are covered.',
        '2(3). Termination of one spouse does not automatically strip rights if the other adheres strictly to compliance.'
      ],
    },
    {
      id: 'sec-3',
      number: 'नियम 3',
      titleHi: 'सहयोग प्राप्ति की सामान्य पात्रता एवं 75% अनिवार्यता',
      titleEn: 'Assistance Eligibility & The 75% Rule',
      icon: Scale,
      category: 'ELIGIBILITY',
      summaryHi: 'संस्था द्वारा जारी कुल सहयोग अपीलों में से न्यूनतम 75% सहयोग पूर्ण किया होना वैधानिक शर्त है।',
      summaryEn: 'Completion of at least 75% of all active community appeals is mandatory to claim assistance.',
      clausesHi: [
        '3(1). संस्था द्वारा दो मुख्य कल्याणकारी परिस्थितियों में सहयोग आयोजित किया जाता है: (क) परिवारिक सदस्य में शामिल अभिभावक (पति-पत्नी) के आकस्मिक निधन/दिवंगत होने पर, तथा (ख) परिवारिक सदस्य में शामिल अधिकतम 02 संतानों के विवाह होने पर।',
        '3(2). 75% स्वर्ण नियम (Golden Rule): संस्था द्वारा की गई समस्त सहयोग अपीलों (दिवंगत + विवाह) में से आवेदक सदस्य द्वारा न्यूनतम 75% सहयोग पूर्ण किया होना अनिवार्य है। 75% से कम सहभागिता पर कोई भी दावा स्वीकार्य नहीं होगा।',
        '3(3). परिवारिक सदस्य की आयु घटना के समय 18 से 65 वर्ष के मध्य होना आवश्यक है।',
        '3(4). सूचना समय-सीमा: किसी सदस्य के निधन की मौखिक सूचना अधिकतम 03 दिवस (72 घंटे) के भीतर संस्था को देना बंधनकारक होगा ताकि अधिकृत जिला पदाधिकारियों द्वारा मौके पर स्थलीय सत्यापन किया जा सके। विधिवत अपील फॉर्म अधिकतम 06 माह के भीतर प्रेषित करना अनिवार्य है।',
        '3(5). विवाह सहयोग अपील: विवाह तिथि से 06 माह पूर्व पोर्टल पर फॉर्म भरने का प्रयास करें, जिससे भौतिक व दस्तावेजी सत्यापन समय पर पूर्ण हो सके। सामान्यतः विवाह तिथि तक आवेदन स्वीकार्य है।',
        '3(6). निष्पक्षता व क्रम: सहयोग अपीलें जिस क्रम में ऑनलाइन प्राप्त व सत्यापित होंगी, उसी क्रम में जारी की जाएंगी (पहले आओ, पहले पाओ)। किसी प्रकार का व्यक्तिगत दबाव, सिफारिश या अनुचित अनुरोध स्वीकार नहीं होगा।',
        '3(7). अविवाहित बच्चों के निधन पर संस्था द्वारा कोई दिवंगत सहयोग प्रदान नहीं किया जाएगा।',
        '3(8). अनिवार्य लॉक-इन अवधि (Lock-in Period): दिवंगत सहयोग हेतु सदस्यता तिथि से न्यूनतम 06 माह, एवं विवाह सहयोग हेतु न्यूनतम 06 माह की सक्रिय सदस्यता अनिवार्य है। लॉक-इन अवधि से पूर्व घटना घटित होने पर कोई सहयोग देय नहीं होगा।'
      ],
      clausesEn: [
        '3(1). JSCT coordinates community assistance under two conditions: (A) Demise of a guardian spouse, and (B) Wedding of up to 2 biological children.',
        '3(2). The 75% Golden Rule: Member must have successfully contributed to at least 75% of all posted community appeals. Claims under 75% compliance will be rejected without exception.',
        '3(3). The age of the concerned family member must be between 18 and 65 years at the time of the event.',
        '3(4). Strict 72-Hour Demise Notice: Verbal intimation to trust within 3 days is compulsory for field verification. Complete claim dossier must be submitted within 6 months.',
        '3(5). Marriage Assistance: Members should submit marriage appeal requests up to 6 months in advance for timely verification.',
        '3(6). Zero-Interference Queue: Appeals are addressed in strict chronological order of verified receipt (First-In, First-Out). Recommendation or coercion is strictly prohibited.',
        '3(7). No bereavement assistance is payable upon the passing of unmarried minor children.',
        '3(8). Strict 6-Month Lock-in: A continuous lock-in period of 6 months from initial registration is mandatory before acquiring eligibility.'
      ],
      criticalAlertHi: 'अनिवार्य मानक: न्यूनतम 75% सहभागिता + 6 माह की लॉक-इन अवधि पूर्ण होने पर ही दिवंगत अथवा विवाह सहयोग का अधिकार प्राप्त होता है।',
      criticalAlertEn: 'Critical Standard: Minimum 75% community participation + 6-month continuous lock-in period required for all claims.',
    },
    {
      id: 'sec-4',
      number: 'नियम 4',
      titleHi: 'दिवंगत की स्थिति में सहयोग प्राप्त करने की पात्रता',
      titleEn: 'Bereavement Assistance Guidelines (Demise Support)',
      icon: Heart,
      category: 'SCHEMES',
      summaryHi: 'सदस्य के निधन पर नामिनी के बैंक खाते में सीधे ₹15,00,000 तक की सम्मानजनक सहायता पहुंचाई जाती है।',
      summaryEn: 'Bereavement assistance of up to ₹15,00,000 sent directly to verified nominee bank accounts.',
      clausesHi: [
        '4(1). दिवंगत सदस्य की आयु निधन के समय 18 से 65 वर्ष के मध्य होना अनिवार्य है।',
        '4(2). संस्था द्वारा प्रेषित कुल सहयोग अपीलों में से सदस्य द्वारा न्यूनतम 75% सहयोग सफलतापूर्वक पूर्ण किया गया होना आवश्यक है।',
        '4(3). सहयोग राशि 100% प्रत्यक्ष रूप से केवल और केवल पंजीकृत नामिनी (Nominee) के बैंक खाते में ही प्रदान की जाएगी। किसी तीसरे व्यक्ति को भुगतान संभव नहीं है।',
        '4(4). हत्या अथवा आत्महत्या की स्थिति में संस्था के अधिकृत तीन सदस्यीय जांच दल द्वारा घटनास्थल का विस्तृत निरीक्षण व पुलिस रिपोर्ट का परीक्षण किया जाएगा। इसके उपरांत ट्रस्ट सहयोग करने/न करने और किस वैधानिक उत्तराधिकारी के खाते में करने हेतु पूर्ण स्वतंत्र होगा।',
        '4(5). ट्रस्ट का निर्णय निष्पक्ष जांच और स्वविवेक पर आधारित होगा, जिस पर कोई राजनीतिक या विधिक दबाव मान्य नहीं होगा।',
        '4(6). इस कल्याण योजना के अंतर्गत सक्रिय सदस्यों की संख्या के आधार पर ₹15,00,000 (पंद्रह लाख) तक की प्रभावी सहायता राशि सीधे नामिनी के खाते में अंतरित कराने का पूर्ण प्रयास किया जाता है।'
      ],
      clausesEn: [
        '4(1). Deceased member must be between 18 and 65 years of age at the time of demise.',
        '4(2). Member must have fulfilled a minimum 75% contribution compliance record on all previous appeals.',
        '4(3). 100% of the funds are transferred directly into the verified bank account of the registered nominee.',
        '4(4). In cases of homicide or suicide, a three-member investigation panel verifies local police records and circumstances before discretionary approval.',
        '4(5). The decision of the Trust Committee is final, binding, and based on objective evidence.',
        '4(6). The scheme mobilizes peer community funds targeting up to ₹15,00,000 directly to the bereaved family.'
      ],
    },
    {
      id: 'sec-5',
      number: 'नियम 5 & 6',
      titleHi: 'विवाह सहयोग योजना (बेटी विवाह सहयोग — ₹5,00,000 तक)',
      titleEn: 'Marriage Solidarity Scheme (Daughter Wedding — Up to ₹5 Lakh)',
      icon: Sparkles,
      category: 'SCHEMES',
      summaryHi: 'संतान के शुभ विवाह पर परिवार को आर्थिक संबल; पुत्री विवाह पर अधिकतम ₹5,00,000 तक का सहयोग।',
      summaryEn: 'Financial solidarity for children’s weddings; up to ₹5,00,000 for daughter’s solemnization.',
      clausesHi: [
        '5(1). इस योजना के अंतर्गत पति-पत्नी की अधिकतम दो संतानों के विवाह हेतु सहयोग कराने का प्रावधान है: (क) अधिकतम दो जैविक पुत्रियाँ, या (ख) एक पुत्री एवं एक पुत्र, या (ग) अधिकतम दो पुत्र।',
        '6(1). विवाह शहनाई सहयोग (बेटी विवाह): सदस्य पति-पत्नी की अधिकतम दो जैविक पुत्रियाँ इस योजना में सम्मिलित हो सकती हैं।',
        '6(2). विवाह के समय पुत्री की आयु न्यूनतम 18 वर्ष पूर्ण होना अनिवार्य है (सक्षम प्रमाण पत्र से पुष्टि आवश्यक)।',
        '6(3). विवाह सहयोग आवेदन केवल माता-पिता की सहमति व हस्ताक्षर से ही मान्य होगा।',
        '6(4). प्रेम विवाह अथवा घर से भागकर विवाह करने की स्थिति में, सक्षम विधिक अधिकारी/न्यायालय द्वारा जारी आधिकारिक विवाह प्रमाण पत्र प्रस्तुत करने पर ही आवेदन पर विचार किया जाएगा।',
        '6(5). सक्रिय सदस्यों के सहयोग से पुत्री के विवाह पर अधिकतम ₹5,00,000 (पाँच लाख रुपये) तक सहयोग एकत्रित कराकर प्रदान करने का प्रयास किया जाता है।'
      ],
      clausesEn: [
        '5(1). Up to two biological children per family unit are eligible for marriage assistance.',
        '6(1). Daughter Wedding Solidarity: Covers up to two biological daughters of compliant members.',
        '6(2). The daughter must have attained the legal age of 18 years at marriage solemnization.',
        '6(3). The application must be initiated and endorsed by the enrolled parent/guardian.',
        '6(4). In cases of self-solemnized or elopement marriages, a government-issued Marriage Registration Certificate is mandatory.',
        '6(5). The collective campaign raises and provides up to ₹5,00,000 directly for the daughter’s wedding.'
      ],
    },
    {
      id: 'sec-7',
      number: 'नियम 7',
      titleHi: 'विवाह सहयोग (पुत्र विवाह हेतु प्रावधान)',
      titleEn: 'Son Wedding Provisions',
      icon: Users,
      category: 'SCHEMES',
      summaryHi: 'परिवार के जैविक पुत्रों के विवाह पर अधिकतम ₹2,00,000 तक का पारस्परिक सहयोग।',
      summaryEn: 'Community assistance up to ₹2,00,000 for biological sons completing 21 years of age.',
      clausesHi: [
        '7(1). परिवारिक सदस्य के अधिकतम दो जैविक पुत्र इस योजना हेतु पात्र हो सकते हैं (यदि दो संतानों का कोटा शेष हो)।',
        '7(2). विवाह के समय पुत्र की आयु न्यूनतम 21 वर्ष पूर्ण होना कानूनन व संस्था नियमानुसार अनिवार्य है।',
        '7(3). पात्र पुत्र के विवाह पर अधिकतम ₹2,00,000 (दो लाख रुपये) तक पारस्परिक सहयोग कराने का प्रयास किया जाता है।',
        '7(4). घर से भागकर विवाह करने की स्थिति में, सक्षम प्राधिकारी द्वारा जारी विवाह प्रमाण पत्र प्रस्तुत होना अनिवार्य है।'
      ],
      clausesEn: [
        '7(1). Up to two biological sons can be accommodated within the family’s 2-children maximum ceiling.',
        '7(2). The son must have attained at least 21 years of age at the time of wedding.',
        '7(3). Mobilizes up to ₹2,00,000 in collective peer assistance for the celebration.',
        '7(4). Marriage registration proof is compulsory where solemnization occurs outside traditional guardianship.'
      ],
    },
    {
      id: 'sec-8',
      number: 'नियम 8',
      titleHi: 'पति-पत्नी दोनों की मृत्यु की दशा में विशेष नियम',
      titleEn: 'Rules in Case of Demise of Both Parents',
      icon: AlertTriangle,
      category: 'SPECIAL',
      summaryHi: 'अविवाहित संतानों को 18 वर्ष की आयु तक सहयोग शुल्क से पूर्ण छूट और पूर्ण सुरक्षा कवरेज।',
      summaryEn: 'Unmarried surviving children are exempt from contribution fees until 18 while retaining full protection.',
      clausesHi: [
        '8(1). पति-पत्नी दोनों की मृत्यु होने पर, उनके अविवाहित जैविक बच्चे स्वतः इस नियम के अंतर्गत संरक्षित माने जाएंगे।',
        '8(2). अविवाहित जैविक बच्चे संस्था के परिवारिक सदस्य के रूप में निरंतर सुरक्षा घेरे में रहेंगे।',
        '8(3). 18 वर्ष की आयु तक ऐसे बच्चों को अन्य सदस्यों हेतु सहयोग राशि भेजने से पूर्ण छूट रहेगी; केवल न्यूनतम ₹50 वार्षिक सदस्यता शुल्क अनिवार्य होगा।',
        '8(4). 18 वर्ष की आयु पूर्ण होने के उपरांत बच्चा अपनी व्यक्तिगत सदस्यता लेकर नियमित सदस्य बन सकता है।',
        '8(5). सहयोग राशि कानूनी अभिभावक/संरक्षक अथवा संस्था द्वारा अनुमोदित विश्वसनीय व्यक्ति के खाते में, या 18 वर्ष पूर्ण होने पर स्वयं बच्चे के खाते में अंतरित की जाएगी।',
        '8(6). विवाह सहयोग हेतु आवेदन कानूनी अभिभावक या निकट संबंधी (चाचा, मामा, मौसी, बुआ) कर सकते हैं; पुत्री के इच्छानुसार खाते में राशि प्रेषित की जाएगी।'
      ],
      clausesEn: [
        '8(1). Upon demise of both parents, surviving unmarried biological children are automatically protected.',
        '8(2). Children retain continuous family membership status.',
        '8(3). Exempt from making ₹50 appeal contributions until age 18; only the basic ₹50 annual renewal is maintained.',
        '8(4). Upon turning 18, the child may transition to an independent individual membership.',
        '8(5). Assistance is disbursed into accounts of court-appointed legal guardians or directly to the child once of legal age.',
        '8(6). Close relatives can file marriage appeals for orphan daughters to safeguard their future.'
      ],
    },
    {
      id: 'sec-9',
      number: 'नियम 9',
      titleHi: 'अनाथ बच्चों की स्थिति एवं संरक्षण',
      titleEn: 'Orphan Child Protection & Welfare Status',
      icon: Info,
      category: 'SPECIAL',
      summaryHi: 'माता-पिता विहीन अनाथ बच्चों को कानूनी संरक्षक के साथ संस्था के कल्याण छत्र में जोड़ा जाता है।',
      summaryEn: 'Orphans without living parents are safeguarded under accredited guardian units.',
      clausesHi: [
        '9(1). अनाथ की परिभाषा: वे बच्चे जिनके माता एवं पिता दोनों जीवित न हों।',
        '9(2). 18 वर्ष से कम आयु के अनाथ बच्चे उनके कानूनी अभिभावक/संरक्षक के परिवारिक सदस्य के रूप में पंजीकृत माने जाएंगे।',
        '9(3). 18 वर्ष पूर्ण कर चुके अनाथ बच्चे स्वयं पृथक सदस्यता ग्रहण करके सभी प्रकार के सहयोग स्वयं अथवा अपने नामिनी के खाते में प्राप्त करने के पूर्ण अधिकारी होंगे।'
      ],
      clausesEn: [
        '9(1). Definition: Children whose biological parents are both deceased.',
        '9(2). Minors under 18 are enrolled under the family membership of their accredited legal guardian.',
        '9(3). Adult orphans aged 18+ can enroll independently and nominate their chosen beneficiaries.'
      ],
    },
    {
      id: 'sec-10',
      number: 'नियम 10, 11, 12',
      titleHi: 'विशेष नियम: क्रमागत 03 चूक एवं 5-वर्षीय दिवंगत सीमा',
      titleEn: 'Mandatory Clauses: Consecutive 3-Miss Rule & 5-Year Bereavement Window',
      icon: Clock,
      category: 'SPECIAL',
      summaryHi: 'लगातार 3 सहयोग न करने पर पात्रता तत्काल समाप्त हो जाती है; दोबारा पात्रता हेतु 3 निरंतर सहयोग अनिवार्य।',
      summaryEn: 'Missing 3 consecutive appeals terminates eligibility immediately; requires 3 consecutive contributions to restore.',
      clausesHi: [
        '10. पति-पत्नी दोनों की एक साथ अथवा 05 वर्ष के अंतराल में मृत्यु होने पर, संस्था द्वारा केवल एक बार दिवंगत सहयोग कराया जाएगा।',
        '11. क्रमागत 03 सहयोग चूक नियम (Consecutive 3-Miss Rule): यदि कोई सदस्य संस्था द्वारा प्रेषित क्रमागत 03 सहयोग अपीलों में सहयोग करने से चूक जाते हैं, तो वे किसी भी प्रकार का सहयोग प्राप्त करने के अपात्र हो जाएंगे। पात्रता पुनः बहाल करने हेतु उन्हें आगामी क्रमागत 03 अपीलों में अनिवार्य रूप से पूर्ण सहयोग करना होगा।',
        '12. 18 वर्ष पूर्ण कर चुके बच्चे यदि पृथक सदस्यता लेकर प्रत्येक निर्धारित सहयोग करते हैं, तो उनकी मृत्यु जैसी किसी भी आकस्मिक घटना में उनकी नामिनी सहयोग पाने हेतु पात्र होगी (अनाथ बच्चों पर यह प्रतिबंध लागू नहीं)।'
      ],
      clausesEn: [
        '10. Single Bereavement Disbursal: If both spouses pass away together or within a 5-year window, bereavement aid is organized once.',
        '11. Consecutive 3-Miss Default Rule: Missing 3 consecutive community appeals strips all claim eligibility immediately. To regain eligibility, member must contribute consecutively to the next 3 successive appeals.',
        '12. Adult children holding separate individual memberships and paying dues are independently insured with their own nominated beneficiaries.'
      ],
      criticalAlertHi: 'चेतावनी: कभी भी लगातार 3 सहयोग न छोड़ें! ऐसा करने पर आपका परिवार स्वतः अपात्र हो जाता है।',
      criticalAlertEn: 'Warning: Never miss 3 consecutive appeals. Doing so instantly invalidates your family’s safety net.',
    },
    {
      id: 'sec-11',
      number: 'नियम 13',
      titleHi: 'सदस्यता की समाप्ति एवं निरस्तीकरण के 15 आधार',
      titleEn: '15 Grounds for Termination & Disqualification of Membership',
      icon: XCircle,
      category: 'TERMINATION',
      summaryHi: 'भ्रामक जानकारी, अनुशासनहीनता, छवि को नुकसान पहुंचाने या नियमों के उल्लंघन पर सदस्यता रद्द की जा सकती है।',
      summaryEn: 'Membership can be revoked for fraudulent disclosures, indiscipline, or breach of trust bylaws.',
      clausesHi: [
        'निम्न 15 परिस्थितियों में सदस्य की सदस्यता तत्काल प्रभाव से समाप्त अथवा निरस्त की जा सकती है:',
        '13(1). निर्धारित 30 दिनों के भीतर वार्षिक सदस्यता शुल्क जमा न करने पर।',
        '13(2). पंजीकरण, सत्यापन अथवा सहयोग के समय गलत, भ्रामक अथवा झूठी जानकारी व फर्जी दस्तावेज़ देने पर।',
        '13(3). सदस्य द्वारा संस्था को स्वेच्छा से लिखित रूप में त्याग पत्र देने पर।',
        '13(4). संस्था की नियमावली, घोषित उद्देश्य अथवा सार्वजनिक आचार संहिता के विरुद्ध कार्य करने पर।',
        '13(5). ट्रस्ट के पदाधिकारियों अथवा अन्य सदस्यों के साथ अमर्यादित, अभद्र अथवा अनुशासनहीन व्यवहार करने पर।',
        '13(6). कार्यकारिणी अथवा सामान्य सभा में सदस्य के विरुद्ध बहुमत से अविश्वास प्रस्ताव सिद्ध होने पर।',
        '13(7). संस्था की महत्वपूर्ण बैठकों एवं अनिवार्य कार्यक्रमों में बिना सूचना लगातार अनुपस्थित रहने पर।',
        '13(8). संस्था की प्रतिष्ठा, विश्वसनीयता अथवा सामाजिक छवि को क्षति पहुँचाने वाले वक्तव्य, लेखन अथवा सोशल मीडिया गतिविधि में संलिप्त पाए जाने पर।',
        '13(9). संस्था के नाम, पद, पहचान, सील अथवा प्रतीक (Logo) का अनाधिकृत व निजी लाभ हेतु दुरुपयोग करने पर।',
        '13(10). संस्था के धन, संपत्ति, अभिलेख, दान अथवा संसाधनों का दुरुपयोग या हेराफेरी करने पर।',
        '13(11). संगठन की आंतरिक व गोपनीय जानकारी को सक्षम अनुमति के बिना सार्वजनिक करने पर।',
        '13(12). किसी भी प्रकार की आपराधिक, अनैतिक अथवा समाज-विरोधी गतिविधि में लिप्त पाए जाने पर।',
        '13(13). ट्रस्ट के वैध निर्णयों, प्रस्तावों अथवा दिशा-निर्देशों का खुला उल्लंघन व अनुशासनहीनता करने पर।',
        '13(14). न्यायालय अथवा किसी सक्षम विधिक प्राधिकारी द्वारा संगीन अपराध में दोषसिद्ध (कन्विक्ट) होने पर।',
        '13(15). सदस्य का आकस्मिक निधन होने पर (सदस्यता स्वतः समाप्त मानी जाएगी)।',
        'नोट: सदस्यता समाप्ति से पूर्व संबंधित सदस्य को कारण बताओ नोटिस (Show Cause Notice) जारी कर पक्ष रखने का यथोचित अवसर दिया जाएगा (विशेष आकस्मिक परिस्थितियों को छोड़कर)।'
      ],
      clausesEn: [
        'Membership may be revoked under any of the following 15 grounds:',
        '13(1). Failure to pay annual renewal fee within the 30-day grace period.',
        '13(2). Submitting fraudulent, forged, or misleading documents at registration or claim time.',
        '13(3). Tendering written resignation to the Trust Management.',
        '13(4). Acting contrary to Trust constitution, ethics, or community interest.',
        '13(5). Indiscipline, defamatory conduct, or abusive behavior toward officials or members.',
        '13(6). Formal no-confidence resolution passed by majority in General Body.',
        '13(7). Unexcused perpetual absence from mandated community meetings.',
        '13(8). Malicious social media campaigns, slander, or damaging the Trust’s public standing.',
        '13(9). Unauthorized commercial exploitation of JSCT identity, emblem, or seals.',
        '13(10). Misappropriation, embezzlement, or unauthorized handling of community funds.',
        '13(11). Unlawful disclosure of confidential internal proceedings and member data.',
        '13(12). Conviction or involvement in anti-social or criminal offenses.',
        '13(13). Defiance of institutional decisions and constitutional mandates.',
        '13(14). Criminal conviction by a competent judicial court of law.',
        '13(15). Demise of the member (natural cessation of individual status).',
        'Note: Fair opportunity to show cause is accorded prior to formal expulsion.'
      ],
    },
    {
      id: 'sec-12',
      number: 'नियम 14–19',
      titleHi: 'अन्य महत्वपूर्ण प्रावधान एवं भविष्य की योजनाएं',
      titleEn: 'General Provisions, Dispute Resolution & Future Programs',
      icon: FileText,
      category: 'GENERAL',
      summaryHi: 'सहयोग अधिकार नहीं बल्कि मानवीय सहायता है; 3 सदस्यीय जांच समिति की रिपोर्ट अंतिम व सर्वमान्य होती है।',
      summaryEn: 'Assistance is a voluntary humanitarian gesture; 3-member inquiry committee report is final and binding.',
      clausesHi: [
        '14. वरिष्ठ सदस्य संबल: जिन सदस्यों ने जीवन भर 75% सहयोग का पालन किया और कोई सहयोग प्राप्त नहीं किया, उन्हें 75 वर्ष की आयु पूर्ण होने पर ट्रस्ट द्वारा अधिकतम ₹10,000 तक की सम्मान सहायता दी जा सकती है (संस्था के वित्तीय संबल पर आधारित)।',
        '15. जीवन रक्षा सहयोग योजना (प्रस्तावित): भविष्य में सदस्यों को असाध्य/गंभीर बीमारियों (कैंसर, किडनी फेलियर, हृदय रोग) में उपचार हेतु विशेष जीवन रक्षा सहायता योजना लागू की जा सकती है।',
        '16. उच्च शिक्षा छात्रवृत्ति (प्रस्तावित): होनहार छात्र-छात्राओं को उच्च शिक्षा व प्रतियोगी परीक्षाओं में संबल देने हेतु छात्रवृत्ति योजना प्रस्तावित है।',
        '17. त्रि-स्तरीय जांच समिति: प्रत्येक क्लेम/सहयोग की स्थिति में संस्था द्वारा 03 सदस्यीय निष्पक्ष जांच समिति गठित की जाएगी। स्थलीय निरीक्षण व दस्तावेजी रिपोर्ट के आधार पर ट्रस्ट का निर्णय अंतिम व सर्वमान्य होगा।',
        '18. विधिक स्थिति: संस्था द्वारा प्रदान की जाने वाली सहायता किसी भी विधिक अधिकार या बीमा अनुबंध के तहत नहीं, बल्कि विशुद्ध पारस्परिक मानवीय सहयोग व सामाजिक उत्तरदायित्व के अंतर्गत आती है।',
        '19. नियमावली संशोधन: परिस्थितियों एवं सदस्यों के व्यापक हित को ध्यान में रखते हुए कार्यकारिणी द्वारा सर्वसम्मति अथवा दो-तिहाई बहुमत से नियमावली में आवश्यक संशोधन किया जा सकता है।'
      ],
      clausesEn: [
        '14. Senior Citizen Solidarity: Members maintaining 75% lifetime compliance with no prior claims may receive up to ₹10,000 upon turning 75 years of age.',
        '15. Critical Illness Lifeline (Proposed): Dedicated emergency health support for severe medical ailments (cancer, organ failure, cardiac emergencies) in development.',
        '16. Higher Education Scholarships (Proposed): Merit-based academic aids for member children pursuing higher and professional education.',
        '17. Three-Member Audit Panel: All appeals undergo strict verification by an independent 3-member inquiry commission. Findings are conclusive and binding.',
        '18. Legal Jurisprudence: Community aid is not an insurance policy or statutory entitlement, but voluntary humanitarian peer-to-peer solidarity.',
        '19. Constitutional Amendments: Rules may be amended by a two-thirds majority in General Council in the best interest of members.'
      ],
    },
  ];

  // Search & Filter
  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
      const matchesCategory = activeCategory === 'ALL' || sec.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle =
        sec.titleHi.toLowerCase().includes(q) ||
        sec.titleEn.toLowerCase().includes(q) ||
        sec.number.toLowerCase().includes(q);
      const matchClausesHi = sec.clausesHi.some((c) => c.toLowerCase().includes(q));
      const matchClausesEn = sec.clausesEn.some((c) => c.toLowerCase().includes(q));
      return matchTitle || matchClausesHi || matchClausesEn;
    });
  }, [sections, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-canvas-inset/30 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 1. EDITORIAL HEADER & OFFICIAL TRUST BADGE */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-border shadow-xs text-xs font-semibold text-charcoal">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            <BookOpen className="w-3.5 h-3.5 text-terracotta" />
            <span>जन सेवा चैरिटेबल ट्रस्ट (JSCT) • आधिकारिक नियमावली व संविधान</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl font-black text-charcoal tracking-tight leading-tight">
            {lang === 'hi' ? 'संस्था की वैधानिक नियमावली' : 'Official Constitution & Bylaws'}
          </h1>

          <p className="font-editorial text-lg sm:text-xl text-terracotta font-bold italic">
            “जन से जन तक, सहयोग हर जरूरतमंद तक”
          </p>

          <p className="text-xs sm:text-sm text-driftwood max-w-2xl mx-auto leading-relaxed">
            {lang === 'hi'
              ? 'यह नियमावली जन सेवा चैरिटेबल ट्रस्ट (JSCT) के समस्त सम्मानित सदस्यों, पदाधिकारियों एवं सहयोगियों के अधिकारों, कर्तव्यों, 75% पात्रता मानकों एवं कल्याणकारी योजनाओं को पारदर्शी रूप से संचालित करने हेतु आबद्ध है।'
              : 'The comprehensive regulatory framework governing rights, responsibilities, 75% compliance standards, and welfare schemes for all members of Jan Sewa Charitable Trust (JSCT).'}
          </p>
        </div>

        {/* 2. 4 CORE PILLARS CALLOUT BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-stone-border shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-terracotta font-bold text-xs uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>75% सहभागिता नियम</span>
            </div>
            <p className="text-[11px] text-driftwood leading-snug">
              समस्त जारी अपीलों में न्यूनतम 75% सहयोग पूर्ण करना अनिवार्य है।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-border shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-sage font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>06 माह लॉक-इन</span>
            </div>
            <p className="text-[11px] text-driftwood leading-snug">
              पंजीकरण तिथि से न्यूनतम 6 माह की निरंतर सक्रिय सदस्यता अनिवार्य।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-border shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4" />
              <span>दिवंगत सहयोग</span>
            </div>
            <p className="text-[11px] text-driftwood leading-snug">
              निधन पर सीधे नामिनी खाते में ₹15 लाख तक की प्रत्यक्ष सहायता।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-border shadow-xs space-y-1">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>विवाह सहयोग</span>
            </div>
            <p className="text-[11px] text-driftwood leading-snug">
              अधिकतम 2 संतानों के विवाह पर ₹5 लाख तक सहयोग राशि।
            </p>
          </div>
        </div>

        {/* 3. INTERACTIVE CONTROL PANEL (SEARCH, CATEGORY PILLS, EXPAND/PRINT) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-border shadow-warm space-y-4">
          
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-driftwood absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'नियमावली में खोजें (उदा. 75%, विवाह, दिवंगत, नामिनी, शुल्क, लॉक पीरियड, समाप्ति)...'
                    : 'Search bylaws (e.g. 75%, wedding, bereavement, nominee, fee, lock-in)...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-border bg-canvas-inset/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-xs sm:text-sm text-charcoal font-medium transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-driftwood hover:text-charcoal px-1.5 py-0.5 rounded-md bg-stone-border/40"
                >
                  हटाएं
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={expandAll}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-stone-border hover:bg-canvas-inset text-charcoal transition-all shadow-xs"
              >
                सभी खोलें
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-stone-border hover:bg-canvas-inset text-charcoal transition-all shadow-xs"
              >
                सभी बंद करें
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-stone-border bg-canvas-inset hover:bg-white text-charcoal flex items-center gap-1.5 transition-all shadow-xs"
                title="प्रिंट करें या पीडीएफ सेव करें"
              >
                <Printer className="w-3.5 h-3.5 text-terracotta" />
                <span className="hidden sm:inline">प्रिंट / PDF</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs no-scrollbar">
            {[
              { id: 'ALL', labelHi: 'सम्पूर्ण नियमावली (12 भाग)', labelEn: 'All Sections' },
              { id: 'ABOUT', labelHi: 'परिचय व ध्येय', labelEn: 'Mission' },
              { id: 'MEMBERSHIP', labelHi: 'सदस्यता व परिवार', labelEn: 'Membership' },
              { id: 'ELIGIBILITY', labelHi: '75% पात्रता नियम', labelEn: '75% Rule' },
              { id: 'SCHEMES', labelHi: 'दिवंगत व विवाह सहयोग', labelEn: 'Schemes' },
              { id: 'SPECIAL', labelHi: 'विशेष व अनाथ नियम', labelEn: 'Special Rules' },
              { id: 'TERMINATION', labelHi: 'सदस्यता समाप्ति', labelEn: 'Termination' },
              { id: 'GENERAL', labelHi: 'वैधानिक प्रावधान', labelEn: 'General' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold text-xs border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-terracotta text-white border-terracotta shadow-xs'
                    : 'bg-white hover:bg-canvas-inset text-driftwood border-stone-border'
                }`}
              >
                {lang === 'hi' ? cat.labelHi : cat.labelEn}
              </button>
            ))}
          </div>

        </div>

        {/* 4. SECTIONS ACCORDION LIST */}
        <div className="space-y-4">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-border p-8 space-y-3">
              <HelpCircle className="w-10 h-10 text-driftwood mx-auto" />
              <p className="text-sm font-semibold text-charcoal">
                &quot;{searchQuery}&quot; से संबंधित कोई नियम नहीं मिला
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-terracotta hover:underline"
              >
                खोज फ़िल्टर रीसेट करें
              </button>
            </div>
          ) : (
            filteredSections.map((sec) => {
              const isOpen = Boolean(openSections[sec.id]);
              const Icon = sec.icon;

              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="bg-white rounded-3xl border border-stone-border shadow-xs overflow-hidden transition-all duration-200"
                >
                  {/* Header / Accordion Trigger */}
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 hover:bg-canvas-inset/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1">
                      <div className="w-10 h-10 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-border/40 text-charcoal font-mono uppercase tracking-wider">
                            {sec.number}
                          </span>
                          <h2 className="text-base sm:text-lg font-bold text-charcoal tracking-tight font-editorial">
                            {lang === 'hi' ? sec.titleHi : sec.titleEn}
                          </h2>
                        </div>
                        <p className="text-xs text-driftwood font-normal leading-relaxed line-clamp-1 sm:line-clamp-none">
                          {lang === 'hi' ? sec.summaryHi : sec.summaryEn}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 p-1 rounded-xl bg-canvas-inset border border-stone-border text-driftwood">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-terracotta' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Body Content */}
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-stone-border/50 space-y-4 animate-in fade-in-50 duration-200">
                      
                      {/* Optional Highlight Alert Banner */}
                      {(sec.criticalAlertHi || sec.criticalAlertEn) && (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-amber-950 text-xs leading-relaxed">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="font-medium">
                            {lang === 'hi' ? sec.criticalAlertHi : sec.criticalAlertEn}
                          </div>
                        </div>
                      )}

                      {/* Clauses List */}
                      <div className="space-y-2.5">
                        {(lang === 'hi' ? sec.clausesHi : sec.clausesEn).map((clause, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-2xl bg-canvas-inset/50 hover:bg-canvas-inset border border-stone-border/60 text-xs sm:text-sm text-charcoal leading-relaxed transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0 mt-2" />
                            <div className="flex-1">{clause}</div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 5. FOOTER ASSISTANCE & OFFICIAL COMMITMENT CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-charcoal to-charcoal-muted text-white shadow-warm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-terracotta uppercase tracking-wider font-mono">
                पारस्परिक सामाजिक उत्तरदायित्व
              </div>
              <h3 className="font-editorial text-2xl font-black">
                {lang === 'hi' ? 'क्या आपके पास नियमावली संबंधी कोई प्रश्न है?' : 'Questions About Our Bylaws?'}
              </h3>
              <p className="text-xs text-white/70 max-w-xl">
                जन सेवा चैरिटेबल ट्रस्ट (JSCT) का उद्देश्य प्रत्येक पीड़ित साथी के परिवार को आत्मसम्मान व आर्थिक सुरक्षा प्रदान करना है। किसी भी शंका या स्पष्टीकरण हेतु हमारी सहायता टीम से संपर्क करें।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="tel:9264945875"
                className="px-4 py-2.5 rounded-xl bg-white text-charcoal hover:bg-canvas-inset font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-terracotta" />
                <span>हेल्पलाइन: 9264945875</span>
              </a>

              <Link
                href="/register"
                className="px-4 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs flex items-center gap-2 transition-all shadow-warm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>अभी सदस्यता ग्रहण करें</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
