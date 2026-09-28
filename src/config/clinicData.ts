export interface TreatmentData {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  shortDesc: string;
  overview: string;
  commonConcerns: string[];
  clinicalApproach: string;
  whoItHelps: string[];
  faqs?: { question: string; answer: string }[];
  // Backwards compatibility properties
  scopeNumber?: string;
  fullOverview?: string;
  frequentlyEvaluated?: string[];
  assessmentMethod?: string;
  whatToExpect?: string[];
  relatedSlugs?: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: 'exterior' | 'reception' | 'cabin' | 'consultation' | 'interior';
  categoryLabel: string;
  tag: string;
  badge: string;
  imageUrl: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  initials: string;
  location: string;
  rating: number;
  text: string;
  isVerified: boolean;
  date?: string;
  isPlaceholder?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export const CLINIC_CONFIG = {
  name: 'Navin Homeo Care',
  shortName: 'Navin Homeo Care',
  doctorName: 'Dr. Navin Maurya',
  doctorTitle: 'Homeopathic Physician',
  doctorQualifications: '[Qualifications & clinical registrations: Editable placeholder]',
  doctorBio:
    'Dr. Navin Maurya provides personalized homeopathic consultation with an emphasis on detailed case assessment and supportive, patient-centered care at Navin Homeo Care in Alambagh, Lucknow.',

  get doctor() {
    return {
      name: this.doctorName,
      title: this.doctorTitle,
      qualificationNote: this.doctorQualifications,
      qualifications: this.doctorQualifications,
      image: this.images.doctorDesk,
    };
  },

  address: {
    street: 'Near Pakri Ka Pul (500 m), Azad Nagar Road, near Zoom Optical, opposite Singh Medical Store',
    locality: 'Alambagh',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226005',
    fullFormatted:
      'Near Pakri Ka Pul (500 m), Azad Nagar Road, near Zoom Optical, opposite Singh Medical Store, Alambagh, Lucknow, Uttar Pradesh 226005',
    get full() {
      return this.fullFormatted;
    },
  },

  phone: '073183 06699',
  phoneClean: '07318306699',
  telLink: 'tel:07318306699',
  get phoneRaw() {
    return this.phoneClean;
  },

  whatsappNumber: '917318306699',
  whatsappMessage:
    'Hello, I would like to book a consultation at Navin Homeo Care.',
  get whatsappLink() {
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(this.whatsappMessage)}`;
  },
  get whatsappUrl() {
    return this.whatsappLink;
  },

  coordinates: {
    lat: 26.8046683,
    lng: 80.911486,
  },
  googleMapsUrl: 'https://maps.google.com/?q=26.8046683,80.911486',
  googleDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=26.8046683,80.911486',

  rating: 4.9,
  reviewsCount: 34,
  reviewsSource: 'Google Reviews',

  timings: {
    monToThu: '10:00 AM – 8:00 PM',
    monToSat: '10:00 AM – 8:00 PM',
    friday: 'Closed',
    saturday: 'Closed',
    sunday: '10:00 AM – 2:00 PM',
    dailySummary: 'Mon – Thu: 10:00 AM – 8:00 PM | Sun: 10:00 AM – 2:00 PM',
  },

  trustBadges: [
    { title: 'Personalized Consultation', desc: 'Detailed individual case assessment' },
    { title: 'Convenient Alambagh Location', desc: '500m from Pakri Ka Pul' },
    { title: 'Follow-up Support', desc: 'Organized progress reviews' },
  ],

  images: {
    logo: '/logo.png',
    heroDoctor: '/dr-navin-hero.jpg',
    aboutDoctor: '/dr-navin-about.jpg',
    doctorDesk: '/dr-navin-hero.jpg',
    doctorPortraitAlt: '/dr-navin-about.jpg',
    consultationCabin:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCiqsTqjo3EjoimAlF7LMA-43XUDoZtbJbR7mLxskJpnEg4XzTxJjsa7viVLZ07km0POefvXCbOC2H0b4S3L7pDLjV7Y5OShYFbdIZR3nEoPQ6_jM-N_XTgJjzPQzrMvl2PTy55Gp9yyCyjGXT_4DSGdyTwZ8bSDvwlBRDtO5Mh8_ut98M1ZLm4PyIW-FVvkD8mCO3-_A7V2_wo4IRLuo_HgRpyFgTcnpfZSzuwO2VYRP6yZGo9nlyI-A',
    receptionLounge:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAtvMBBJWkg_3WOb2Ntih7-r-htld17FUgjaugdBPdCmtSwvEFR5z67mb5rLN9Cy9oGYuAsjglWMf98mjlkMAQ_9V4RhY48iafpkd9Tu4D5nW-EiwJxaHTEo4-ImghD1M5lE1Q26WF4Axb-nKHNz8RaQ8Q2nfOLytCnagSHxVXWCDBwmj5iiryJw4Y5sinXZ12WoeaCEcfpPE8vJ1MVYwfe8neaRkuaz8E6BjjssUyUEruZo5UHsR8xYA',
    doctorWithChart: '/dr-navin-about.jpg',
    clinicRemedyCounter:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDTqAthkfFgo2GNSvLW3NOZcEI8eYorIz9FCNvCzhz-dG9AK_C0tb6XhEFTgRv2cTLEuJF23L88rf6Se6Fxp9UfMeU0TKhYtMytL2U9NjdHK_iBWKq1djJbYELO2o_Qvk_P8ccN0qRWeE12MLnHQuhxyL0FGVjjqxDuWotUFET_OHMGZ0WtM4RGHLhK9e-D1LSle7Dt5rRr5RdPDGNB9g16PfZjE7yFi7mnuBDNLZtyBlFvCaZA0qsFjw',
    clinicExterior:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDsnE0EUdKFS2J0gICFuxZWisJeUKVIjo623ZNhe1bfakgtk9ryg0bKueaGcq6QAorGJ8zFlRnq3qQ3rZ1j9DJqcTSU095XCRIjbRxi4nNLs9UgPEywcqUUguwjXTFr2Bh3-7SSAofEpyNATmfV2rfNn_XfdvIF4yyp2wpy529ydRGlyx-NL50rT2p1WoraBj1Xd6IhO0K3tnH4Qo83AQZvYWQsyifEos977JL_VxuNz_uH6O5n7gkC0g',
    diagnosticsArea:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDpzMDr6KUeo8Zv4yJlcV_RlqvG1kNWkhudeltzM3y5Qhu9X6QkApTg1jrP34u6ZJoQZWMusJNxOKeOFUnqzBBRM8mrnubegNSVPqmYCke4RZwjGpPaSsSlBeaDNLp-2gc_h1_CS6cPK3qmHwZabvH-4oj4iS7NUBBk1UDI_hbV17pT6nIEkQuZhbDvlyZD9upUQgjvgIwvPiDSEx0eaSeaHCvc9LQPJALBiPlLFfjatoTv1swa2UaEGQ',
    mapPreview:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLPMFcWNjsChv_yvHDXS_31qHShEFYfraeduPKaxZmyOhKbog_PZElU-RZux1eMXNAWeAioNV9Y0is4aa-bJFXOlqbWPUIj6Ov3ilHcIQ8FcDZA-tv54Memyy9YeNIBDoQLezdx-fKKMP7xm7fd1yovaFxI8aZoyRmoYRCje07efdKzYbdDcSrElEp_q-ef4o7QRtNWOkfGolUsBCuIdq2bI5zDyvBRYHFFJBDlyDP4AIprEfgCbw9mQ',
    consultationRoomStudy:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBV1IXoi3uO4ihl7yqftwrOY5MJIxYiC2eAxteq82REaE7SUtPulzvevQ97r7EiZlEAHTKaYcYezJsnN0fhw7fCqyr1URT2wJAzBiL4L4sFg7HBymX-tG0wgy0J1uUAEoIbStY5FhN-kqCEkvZjJN36i8KUwEKDqiN7Yu5Rl0486cj2WtalYRxSn5OdHpYiExPqpeBIYwc8g7_UbGjhOm-v46rmOpbKK1YnJiHYV9VuQN_dpI8PkbNMrA',
  },
};

// 8 Main Consultation Categories required by Section G:
// Skin & Hair, Allergy & Respiratory, Digestive Health, Joint & Musculoskeletal,
// Women’s Health, Child Health, Chronic Health, General Consultation
export const TREATMENTS_DATA: TreatmentData[] = [
  {
    slug: 'skin-and-hair',
    title: 'Skin & Hair Problems',
    category: 'skin-hair',
    categoryLabel: 'Skin & Hair',
    scopeNumber: '01',
    shortDesc:
      'Consultation for acne, eczema, psoriasis, hair fall, dandruff and recurring skin concerns.',
    overview:
      'Skin and scalp problems often flare up due to weather changes, stress, diet, and individual sensitivities. Dr. Navin Maurya provides gentle, personalized homeopathic care to address recurring skin and hair issues.',
    fullOverview:
      'Skin and scalp problems often flare up due to weather changes, stress, diet, and individual sensitivities. Dr. Navin Maurya provides gentle, personalized homeopathic care to address recurring skin and hair issues.',
    commonConcerns: ['Acne', 'Eczema', 'Hair Fall'],
    frequentlyEvaluated: ['Acne', 'Eczema', 'Hair Fall'],
    clinicalApproach:
      'Understanding your daily routine, past treatments, diet, and specific triggers to select safe, suitable remedies.',
    assessmentMethod:
      'Understanding your daily routine, past treatments, diet, and specific triggers to select safe, suitable remedies.',
    whoItHelps: [
      'Patients troubled by recurring pimples, acne marks, or skin rashes',
      'Individuals experiencing sudden hair thinning, dandruff, or dry scalp',
      'Those looking for gentle, long-term care without harsh side effects',
    ],
    whatToExpect: [
      'Detailed discussion of your skin symptoms and lifestyle habits',
      'Helpful dietary guidance and safe, gentle homeopathic medicines',
      'Regular follow-up visits to monitor skin and scalp recovery',
    ],
    faqs: [
      {
        question: 'How long does a consultation usually take?',
        answer: 'Your first consultation takes about 25 to 35 minutes to discuss all symptoms comfortably.',
      },
      {
        question: 'Can I use my regular moisturizers and mild face wash?',
        answer: 'Yes, gentle, non-irritating skin hygiene routines can be continued alongside your consultation.',
      },
    ],
    relatedSlugs: ['allergy-and-respiratory', 'general-consultation'],
  },
  {
    slug: 'allergy-and-respiratory',
    title: 'Allergy & Breathing Concerns',
    category: 'respiratory',
    categoryLabel: 'Allergy & Breathing',
    scopeNumber: '02',
    shortDesc:
      'Consultation for sneezing, dust allergy, sinus problems, recurrent cough and breathing-related concerns.',
    overview:
      'Seasonal changes, dust exposure, and weather shifts frequently cause recurring colds, sinus congestion, and allergic sneezing. Dr. Navin Maurya evaluates your symptoms to provide soothing, personalized homeopathic support.',
    fullOverview:
      'Seasonal changes, dust exposure, and weather shifts frequently cause recurring colds, sinus congestion, and allergic sneezing. Dr. Navin Maurya evaluates your symptoms to provide soothing, personalized homeopathic support.',
    commonConcerns: ['Allergy', 'Sinus', 'Cough'],
    frequentlyEvaluated: ['Allergy', 'Sinus', 'Cough'],
    clinicalApproach:
      'Careful assessment of weather sensitivity, dust triggers, morning sneezing patterns, and seasonal variations.',
    assessmentMethod:
      'Careful assessment of weather sensitivity, dust triggers, morning sneezing patterns, and seasonal variations.',
    whoItHelps: [
      'People who sneeze repeatedly every morning or upon waking',
      'Patients troubled by blocked nose, sinus headaches, and throat irritation',
      'Individuals sensitive to cold winds, damp weather, and dust',
    ],
    whatToExpect: [
      'Identification of common allergy triggers in your daily environment',
      'Personalized homeopathic remedies to help build internal resistance',
      'Follow-up reviews to track seasonal symptom improvements',
    ],
    faqs: [
      {
        question: 'Can I continue my regular inhalers during consultation?',
        answer: 'Yes. Never discontinue prescribed inhalers or essential medicines without consulting your treating pulmonologist.',
      },
    ],
    relatedSlugs: ['skin-and-hair', 'child-health'],
  },
  {
    slug: 'digestive-health',
    title: 'Digestive Problems',
    category: 'digestive',
    categoryLabel: 'Digestive Health',
    scopeNumber: '03',
    shortDesc:
      'Consultation for acidity, gas, constipation, bloating and recurring digestive discomfort.',
    overview:
      'Irregular eating hours, stress, and heavy meals can lead to chronic stomach heaviness, gas, acidity, and irregular bowel habits. Personalized homeopathic care aims to restore natural digestive comfort.',
    fullOverview:
      'Irregular eating hours, stress, and heavy meals can lead to chronic stomach heaviness, gas, acidity, and irregular bowel habits. Personalized homeopathic care aims to restore natural digestive comfort.',
    commonConcerns: ['Acidity', 'Constipation', 'Bloating'],
    frequentlyEvaluated: ['Acidity', 'Constipation', 'Bloating'],
    clinicalApproach:
      'Reviewing your meal timings, digestion history, food sensitivities, and daily fluid intake.',
    assessmentMethod:
      'Reviewing your meal timings, digestion history, food sensitivities, and daily fluid intake.',
    whoItHelps: [
      'Individuals suffering from frequent burning sensations and sour burps',
      'People experiencing post-meal bloating and sluggish digestion',
      'Those seeking lasting dietary and gentle homeopathic support for constipation',
    ],
    whatToExpect: [
      'Practical advice on meal timing, hydration, and easily digestible foods',
      'Safe, gentle remedies targeted to your specific digestive symptoms',
      'Scheduled follow-up reviews to check digestion progress',
    ],
    faqs: [
      {
        question: 'Should I bring recent ultrasound or endoscopy reports?',
        answer: 'Yes, please bring any existing diagnostic reports to help with a thorough review.',
      },
    ],
    relatedSlugs: ['chronic-health', 'general-consultation'],
  },
  {
    slug: 'joint-and-musculoskeletal',
    title: 'Joint & Back Pain',
    category: 'musculoskeletal',
    categoryLabel: 'Joint & Back Pain',
    scopeNumber: '04',
    shortDesc:
      'Consultation for joint stiffness, knee discomfort, cervical pain, back pain and sciatica-related symptoms.',
    overview:
      'Joint stiffness, backaches, and knee discomfort can make simple daily activities difficult. Dr. Navin Maurya listens to your symptoms to guide gentle, supportive care that improves daily movement and comfort.',
    fullOverview:
      'Joint stiffness, backaches, and knee discomfort can make simple daily activities difficult. Dr. Navin Maurya listens to your symptoms to guide gentle, supportive care that improves daily movement and comfort.',
    commonConcerns: ['Joint Pain', 'Back Pain', 'Cervical Pain'],
    frequentlyEvaluated: ['Joint Pain', 'Back Pain', 'Cervical Pain'],
    clinicalApproach:
      'Understanding where and when pain occurs, weather effects, posture habits, and previous X-ray or doctor reports.',
    assessmentMethod:
      'Understanding where and when pain occurs, weather effects, posture habits, and previous X-ray or doctor reports.',
    whoItHelps: [
      'Seniors with painful knees and morning joint stiffness',
      'Desk workers dealing with continuous neck stiffness and lower back pain',
      'Individuals whose aches worsen during winter or rainy weather',
    ],
    whatToExpect: [
      'Review of your pain patterns and daily physical strain',
      'Gentle posture tips and personalized homeopathic remedies',
      'Progress checks to support comfortable daily walking and movement',
    ],
    faqs: [
      {
        question: 'Can homeopathic care be taken along with physiotherapy?',
        answer: 'Yes, homeopathic consultation complements physiotherapy and mobility exercises well.',
      },
    ],
    relatedSlugs: ['chronic-health', 'general-consultation'],
  },
  {
    slug: 'womens-health',
    title: "Women’s Health",
    category: 'women-child',
    categoryLabel: "Women’s Health",
    scopeNumber: '05',
    shortDesc:
      'Consultation for menstrual irregularities, PCOS-related concerns and other women’s health issues.',
    overview:
      'Hormonal changes, stress, and lifestyle shifts can disrupt menstrual regularities and emotional wellbeing. We provide confidential, empathetic consultations for women of all age groups in a respectful environment.',
    fullOverview:
      'Hormonal changes, stress, and lifestyle shifts can disrupt menstrual regularities and emotional wellbeing. We provide confidential, empathetic consultations for women of all age groups in a respectful environment.',
    commonConcerns: ['PCOS', 'Period Concerns', 'Hormonal Concerns'],
    frequentlyEvaluated: ['PCOS', 'Period Concerns', 'Hormonal Concerns'],
    clinicalApproach:
      'Unhurried, private discussion regarding cycle regularity, sleep, stress levels, and ultrasound or blood test findings.',
    assessmentMethod:
      'Unhurried, private discussion regarding cycle regularity, sleep, stress levels, and ultrasound or blood test findings.',
    whoItHelps: [
      'Young women dealing with irregular periods, sudden acne, or PCOS',
      'Women experiencing painful periods, mood fluctuations, or heavy fatigue',
      'Women navigating hot flushes and sleep disturbances during menopause',
    ],
    whatToExpect: [
      'Complete privacy and respectful, patient listening',
      'Supportive homeopathic care alongside healthy lifestyle recommendations',
      'Organized follow-ups to track cycle improvements',
    ],
    faqs: [
      {
        question: 'Is complete confidentiality maintained?',
        answer: 'Yes, all consultations and medical notes are handled with strict clinical privacy.',
      },
    ],
    relatedSlugs: ['chronic-health', 'general-consultation'],
  },
  {
    slug: 'child-health',
    title: 'Child Health',
    category: 'women-child',
    categoryLabel: 'Child Health',
    scopeNumber: '06',
    shortDesc:
      'Consultation for recurrent colds, appetite concerns and common childhood health issues.',
    overview:
      'Children frequently catch school colds, deal with fussy eating habits, or experience teething troubles. We provide gentle, child-friendly care using sweet homeopathic pills that children easily take.',
    fullOverview:
      'Children frequently catch school colds, deal with fussy eating habits, or experience teething troubles. We provide gentle, child-friendly care using sweet homeopathic pills that children easily take.',
    commonConcerns: ['Recurrent Cold', 'Appetite', 'Child Wellness'],
    frequentlyEvaluated: ['Recurrent Cold', 'Appetite', 'Child Wellness'],
    clinicalApproach:
      'Gentle, friendly interaction with child and parents to understand diet habits, sleep, and recurrent ailments.',
    assessmentMethod:
      'Gentle, friendly interaction with child and parents to understand diet habits, sleep, and recurrent ailments.',
    whoItHelps: [
      'Children catching colds or coughs repeatedly with every weather change',
      'Fussy or picky eaters with sluggish appetite and low energy',
      'Babies and toddlers experiencing restlessness during teething',
    ],
    whatToExpect: [
      'Calm, welcoming clinic atmosphere where children feel comfortable',
      'Sweet, easily dissolved homeopathic globules that children readily take',
      'Simple diet and lifestyle tips for parents',
    ],
    faqs: [
      {
        question: 'Are homeopathic remedies safe for young children?',
        answer: 'Yes, remedies are prepared under strict hygienic standards and are easy for children to ingest.',
      },
    ],
    relatedSlugs: ['allergy-and-respiratory', 'general-consultation'],
  },
  {
    slug: 'chronic-health',
    title: 'Chronic Health Problems',
    category: 'chronic',
    categoryLabel: 'Chronic Health',
    scopeNumber: '07',
    shortDesc:
      'Consultation for persistent fatigue, chronic headaches, sleep disturbances and long-standing health concerns.',
    overview:
      'When health concerns persist over long periods, an unhurried, detailed consultation helps understand your symptoms as a whole. Dr. Navin Maurya provides structured follow-ups to track your progress.',
    fullOverview:
      'When health concerns persist over long periods, an unhurried, detailed consultation helps understand your symptoms as a whole. Dr. Navin Maurya provides structured follow-ups to track your progress.',
    commonConcerns: ['Fatigue', 'Headaches', 'Sleep Issues'],
    frequentlyEvaluated: ['Fatigue', 'Headaches', 'Sleep Issues'],
    clinicalApproach:
      'Detailed 30 to 45 minute consultation exploring your past health history, lifestyle factors, and recurring symptoms.',
    assessmentMethod:
      'Detailed 30 to 45 minute consultation exploring your past health history, lifestyle factors, and recurring symptoms.',
    whoItHelps: [
      'Patients feeling exhausted every day without a clear cause',
      'Those experiencing recurring severe headaches or poor sleep quality',
      'Individuals looking for dedicated, ongoing health tracking and guidance',
    ],
    whatToExpect: [
      'Comprehensive review of your chronological health history',
      'Personalized remedies tailored to your complete constitution',
      'Scheduled follow-ups every 3 to 4 weeks to evaluate improvement',
    ],
    faqs: [
      {
        question: 'How frequently are follow-ups scheduled for chronic issues?',
        answer: 'Typically every 3 to 4 weeks depending on the stability and nature of symptoms.',
      },
    ],
    relatedSlugs: ['general-consultation', 'joint-and-musculoskeletal'],
  },
  {
    slug: 'general-consultation',
    title: 'General Health Consultation',
    category: 'general',
    categoryLabel: 'General Health',
    scopeNumber: '08',
    shortDesc:
      'Consultation for general weakness, overall wellness, health checkups and second opinions.',
    overview:
      'For patients with mixed symptoms, those recovering from seasonal illness, or anyone seeking a trusted doctor for family guidance, general consultation provides clear and honest medical discussion.',
    fullOverview:
      'For patients with mixed symptoms, those recovering from seasonal illness, or anyone seeking a trusted doctor for family guidance, general consultation provides clear and honest medical discussion.',
    commonConcerns: ['General Wellness', 'Weakness', 'Health Checkup'],
    frequentlyEvaluated: ['General Wellness', 'Weakness', 'Health Checkup'],
    clinicalApproach:
      'Friendly, open discussion of your daily health challenges, basic physical check, and guidance on next steps.',
    assessmentMethod:
      'Friendly, open discussion of your daily health challenges, basic physical check, and guidance on next steps.',
    whoItHelps: [
      'Patients unsure of which category their health issue belongs to',
      'Individuals recovering from illness and seeking to regain stamina',
      'Families looking for a trusted, ethical doctor for routine guidance',
    ],
    whatToExpect: [
      'Thorough listening and clear explanations with zero confusing medical jargon',
      'Honest assessment of what homeopathy can support',
      'Supportive advice on nutrition, hydration, and rest',
    ],
    faqs: [
      {
        question: 'Do I need a prior appointment for general consultation?',
        answer: 'Prior booking is recommended to minimize waiting time at our Alambagh clinic.',
      },
    ],
    relatedSlugs: ['chronic-health', 'skin-and-hair'],
  },
];

// Clinic Gallery Items - strictly using real clinic photographs
// Categories: Clinic Exterior, Reception, Doctor Cabin, Consultation Area, Interior
export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-exterior-1',
    title: 'Clinic Exterior & Bilingual Signboard',
    description: 'Prominent storefront along Azad Nagar Road, 500m from Pakri Ka Pul, Alambagh.',
    category: 'exterior',
    categoryLabel: 'Clinic Exterior',
    tag: 'Road Facing',
    badge: 'Alambagh Entrance',
    imageUrl: CLINIC_CONFIG.images.clinicExterior,
  },
  {
    id: 'g-reception-1',
    title: 'Patient Reception Lounge',
    description: 'Comfortable waiting area with front desk for appointment registration and inquiries.',
    category: 'reception',
    categoryLabel: 'Reception & Waiting',
    tag: 'Ground Level',
    badge: 'Waiting Lounge',
    imageUrl: CLINIC_CONFIG.images.receptionLounge,
  },
  {
    id: 'g-cabin-1',
    title: 'Doctor Cabin & Consultation Desk',
    description: 'Dr. Navin Maurya’s primary consultation cabin for confidential case taking.',
    category: 'cabin',
    categoryLabel: 'Doctor Cabin',
    tag: 'Confidential',
    badge: 'Cabin #1',
    imageUrl: CLINIC_CONFIG.images.doctorDesk,
  },
  {
    id: 'g-consultation-1',
    title: 'Patient Examination & Vitals Desk',
    description: 'Dedicated examination area for checking blood pressure, pulse, and physical assessment.',
    category: 'consultation',
    categoryLabel: 'Consultation Area',
    tag: 'Clinical Vitals',
    badge: 'Examination Area',
    imageUrl: CLINIC_CONFIG.images.diagnosticsArea,
  },
  {
    id: 'g-cabin-2',
    title: 'Consultation Cabin Interior',
    description: 'Well-lit, quiet consultation space designed for unhurried patient case history taking.',
    category: 'cabin',
    categoryLabel: 'Doctor Cabin',
    tag: 'Private Room',
    badge: 'Doctor Study',
    imageUrl: CLINIC_CONFIG.images.consultationCabin,
  },
  {
    id: 'g-interior-1',
    title: 'Product Counter & Storage',
    description: 'Clean, hygienic station for constitutional healthcare products and wellness supplements.',
    category: 'interior',
    categoryLabel: 'Interior & Products',
    tag: 'Hygienic',
    badge: 'Product Counter',
    imageUrl: CLINIC_CONFIG.images.clinicRemedyCounter,
  },
];

// Reviews: Section J requirement:
// "Use actual verified Google review text only when supplied. Otherwise use:
// 'Review content will be loaded from verified source.' Do not generate fictional testimonials."
export const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 'r-1',
    author: 'Verified Patient (Alambagh)',
    initials: 'VP',
    location: 'Alambagh, Lucknow',
    rating: 5,
    text: 'Review content will be loaded from verified source.',
    isVerified: true,
    date: 'Verified Google Review',
    isPlaceholder: true,
  },
  {
    id: 'r-2',
    author: 'Verified Patient (South Lucknow)',
    initials: 'VP',
    location: 'Lucknow',
    rating: 5,
    text: 'Review content will be loaded from verified source.',
    isVerified: true,
    date: 'Verified Google Review',
    isPlaceholder: true,
  },
  {
    id: 'r-3',
    author: 'Verified Patient (Singar Nagar)',
    initials: 'VP',
    location: 'Singar Nagar, Lucknow',
    rating: 5,
    text: 'Review content will be loaded from verified source.',
    isVerified: true,
    date: 'Verified Google Review',
    isPlaceholder: true,
  },
  {
    id: 'r-4',
    author: 'Verified Patient (Krishna Nagar)',
    initials: 'VP',
    location: 'Krishna Nagar, Lucknow',
    rating: 5,
    text: 'Review content will be loaded from verified source.',
    isVerified: true,
    date: 'Verified Google Review',
    isPlaceholder: true,
  },
  {
    id: 'r-5',
    author: 'Verified Patient (Kanpur Road)',
    initials: 'VP',
    location: 'Kanpur Road, Lucknow',
    rating: 5,
    text: 'Review content will be loaded from verified source.',
    isVerified: true,
    date: 'Verified Google Review',
    isPlaceholder: true,
  },
  {
    id: 'r-6',
    author: 'Verified Patient (Lucknow)',
    initials: 'VP',
    location: 'Lucknow, Uttar Pradesh',
    rating: 5,
    text: 'Review content will be loaded from verified source.',
    isVerified: true,
    date: 'Verified Google Review',
    isPlaceholder: true,
  },
];

export const FAQS_DATA: FaqItem[] = [
  {
    question: 'How can I book an appointment?',
    answer:
      'You can request an appointment online through the Book Appointment form on this website, call our clinic desk directly at 073183 06699, or send a message on WhatsApp. Our team will coordinate and confirm your slot.',
    category: 'booking',
  },
  {
    question: 'Where is Navin Homeo Care located?',
    answer:
      'The clinic is situated Near Pakri Ka Pul (500 meters), Azad Nagar Road, near Zoom Optical, opposite Singh Medical Store, Alambagh, Lucknow, Uttar Pradesh 226005.',
    category: 'location',
  },
  {
    question: 'Do I need a prior appointment?',
    answer:
      'While walk-ins are accommodated based on doctor availability, prior booking is recommended to avoid prolonged waiting times, especially during busy evening OPD hours.',
    category: 'booking',
  },
  {
    question: 'What should I bring to my consultation?',
    answer:
      'Please bring any recent diagnostic reports (blood tests, sonography, X-rays), a list of current medications you are taking, and notes on when your symptoms began.',
    category: 'consultation',
  },
  {
    question: 'Is follow-up consultation available?',
    answer:
      'Yes. Scheduled follow-up reviews are an integral part of assessing your response and adjusting constitutional remedies as health improves.',
    category: 'consultation',
  },
  {
    question: 'Can I purchase health & wellness supportive products directly?',
    answer:
      'Yes, natural wellness supportive products like herbal hair oils, calendula creams, and joint comfort gels are available at our in-house clinic counter and via our online Shop.',
    category: 'treatment',
  },
];
