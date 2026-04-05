export interface Service {
  id: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  shortDescEn: string;
  shortDescAr: string;
  fullDescEn: string;
  fullDescAr: string;
  priceEn: string;
  priceAr: string;
  durationEn: string;
  durationAr: string;
  warrantyEn: string;
  warrantyAr: string;
  image: string;
  features: { en: string; ar: string }[];
  process: { en: string; ar: string }[];
  faq: { questionEn: string; questionAr: string; answerEn: string; answerAr: string }[];
  relatedServices: string[];
}