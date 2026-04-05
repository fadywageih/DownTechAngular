import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { RouterModule, ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { LanguageService } from "../../../core/services/language.service";

interface ServiceDetail {
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
  relatedServices: { id: string; titleEn: string; titleAr: string; icon: string }[];
}

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceDetailsComponent implements OnInit, OnDestroy {
  currentLang = 'en';
  service: ServiceDetail | null = null;
  loading = true;
  faqOpenStates: boolean[] = [];
  private langSubscription!: Subscription;
  private routeSubscription!: Subscription;

  private servicesDatabase: { [key: string]: ServiceDetail } = {
    'hardware-upgrade': {
      id: 'hardware-upgrade',
      icon: 'fa-microchip',
      titleEn: 'Hardware Upgrade',
      titleAr: 'ترقية العتاد',
      shortDescEn: 'Boost your device performance with professional hardware upgrades',
      shortDescAr: 'عزز أداء جهازك مع ترقيات العتاد الاحترافية',
      fullDescEn: `Upgrade your laptop or PC with the latest hardware components to dramatically improve performance. Our expert technicians will help you select the right parts based on your needs and budget, then professionally install and optimize them for maximum performance.

We specialize in SSD upgrades, RAM expansion, battery replacement, thermal paste application, and more. Whether you're a gamer, designer, developer, or regular user, we have the perfect upgrade solution for you.`,
      fullDescAr: `قم بترقية جهاز اللابتوب أو الكمبيوتر الخاص بك بأحدث مكونات العتاد لتحسين الأداء بشكل كبير. سيساعدك خبراؤنا الفنيون في اختيار القطع المناسبة بناءً على احتياجاتك وميزانيتك، ثم يقومون بتركيبها وتحسينها بشكل احترافي للحصول على أقصى أداء.

نحن متخصصون في ترقيات SSD، توسيع الرام، استبدال البطارية، معجون حراري، والمزيد. سواء كنت لاعبًا أو مصممًا أو مطورًا أو مستخدمًا عاديًا، لدينا حل الترقية المثالي لك.`,
      priceEn: 'Starting from 500 EGP',
      priceAr: 'تبدأ من 500 جنيه',
      durationEn: '1-2 hours',
      durationAr: '1-2 ساعات',
      warrantyEn: '6 months on parts',
      warrantyAr: '6 أشهر على القطع',
      image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=1200&h=600&fit=crop',
      features: [
        { en: 'Faster boot and load times', ar: 'تشغيل أسرع وتحميل أسرع' },
        { en: 'Smooth multitasking', ar: 'تعدد مهام سلس' },
        { en: 'Extended battery life', ar: 'عمر بطارية أطول' },
        { en: 'Better gaming performance', ar: 'أداء ألعاب أفضل' },
        { en: 'Original quality parts', ar: 'قطع غيار أصلية' },
        { en: 'Professional installation', ar: 'تركيب احترافي' }
      ],
      process: [
        { en: 'Free consultation & diagnosis', ar: 'استشارة وتشخيص مجاني' },
        { en: 'Component selection', ar: 'اختيار المكونات' },
        { en: 'Professional installation', ar: 'تركيب احترافي' },
        { en: 'Performance testing', ar: 'اختبار الأداء' },
        { en: 'Optimization & delivery', ar: 'تحسين وتسليم' }
      ],
      faq: [
        {
          questionEn: 'How do I know what upgrade I need?',
          questionAr: 'كيف أعرف ما هي الترقية التي أحتاجها؟',
          answerEn: 'We offer free diagnostic service to assess your current hardware and recommend the best upgrades based on your usage patterns and performance goals.',
          answerAr: 'نقدم خدمة تشخيص مجانية لتقييم العتاد الحالي الخاص بك والتوصية بأفضل الترقيات بناءً على أنماط الاستخدام وأهداف الأداء الخاصة بك.'
        },
        {
          questionEn: 'Will upgrading void my warranty?',
          questionAr: 'هل الترقية تبطل الضمان؟',
          answerEn: 'We use original parts and professional installation that typically doesn\'t void manufacturer warranty. We also provide our own 6-month warranty on all parts and labor.',
          answerAr: 'نستخدم قطع غيار أصلية وتركيب احترافي لا يبطل ضمان الشركة المصنعة عادةً. نقدم أيضًا ضمان خاص بنا لمدة 6 أشهر على جميع القطع والعمالة.'
        }
      ],
      relatedServices: [
        { id: 'virus-removal', titleEn: 'Virus Removal', titleAr: 'إزالة الفيروسات', icon: 'fa-shield-virus' },
        { id: 'system-tuneup', titleEn: 'System Tune-up', titleAr: 'تحسين النظام', icon: 'fa-chart-line' }
      ]
    },
    'virus-removal': {
      id: 'virus-removal',
      icon: 'fa-shield-virus',
      titleEn: 'Virus Removal',
      titleAr: 'إزالة الفيروسات',
      shortDescEn: 'Complete virus and malware removal with system optimization',
      shortDescAr: 'إزالة كاملة للفيروسات والبرامج الضارة مع تحسين النظام',
      fullDescEn: `Protect your digital life with our comprehensive virus and malware removal service. We perform deep system scans to detect and eliminate all types of threats including viruses, spyware, ransomware, and trojans.

After removing all threats, we optimize your system for peak performance, update security settings, and provide recommendations to prevent future infections. Your privacy and data security are our top priorities.`,
      fullDescAr: `احمِ حياتك الرقمية من خلال خدمتنا الشاملة لإزالة الفيروسات والبرامج الضارة. نقوم بفحص عميق للنظام للكشف عن جميع أنواع التهديدات بما في ذلك الفيروسات وبرامج التجسس والفدية وأحصنة طروادة والقضاء عليها.

بعد إزالة جميع التهديدات، نقوم بتحسين نظامك للحصول على أداء مثالي، وتحديث إعدادات الأمان، وتقديم توصيات لمنع الإصابات المستقبلية. خصوصيتك وأمان بياناتك هي أولوياتنا القصوى.`,
      priceEn: 'Starting from 300 EGP',
      priceAr: 'تبدأ من 300 جنيه',
      durationEn: '1-3 hours',
      durationAr: '1-3 ساعات',
      warrantyEn: '30 days free re-scan',
      warrantyAr: '30 يوم إعادة فحص مجاني',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop',
      features: [
        { en: 'Complete threat removal', ar: 'إزالة كاملة للتهديدات' },
        { en: 'Data protection', ar: 'حماية البيانات' },
        { en: 'Performance optimization', ar: 'تحسين الأداء' },
        { en: 'Security hardening', ar: 'تعزيز الأمان' },
        { en: 'Browser cleanup', ar: 'تنظيف المتصفح' },
        { en: 'Real-time protection setup', ar: 'إعداد حماية فورية' }
      ],
      process: [
        { en: 'Initial system scan', ar: 'فحص أولي للنظام' },
        { en: 'Threat detection', ar: 'كشف التهديدات' },
        { en: 'Virus removal', ar: 'إزالة الفيروسات' },
        { en: 'System cleanup', ar: 'تنظيف النظام' },
        { en: 'Security optimization', ar: 'تحسين الأمان' }
      ],
      faq: [
        {
          questionEn: 'How do I know if my device has a virus?',
          questionAr: 'كيف أعرف إذا كان جهازي به فيروس؟',
          answerEn: 'Common signs include: slow performance, pop-up ads, crashes, unusual hard drive activity, browser redirects, and files being encrypted or deleted.',
          answerAr: 'تشمل العلامات الشائعة: الأداء البطيء، الإعلانات المنبثقة، الأعطال، نشاط القرص الصلب غير المعتاد، إعادة توجيه المتصفح، وتشفير أو حذف الملفات.'
        }
      ],
      relatedServices: [
        { id: 'system-tuneup', titleEn: 'System Tune-up', titleAr: 'تحسين النظام', icon: 'fa-chart-line' },
        { id: 'hardware-upgrade', titleEn: 'Hardware Upgrade', titleAr: 'ترقية العتاد', icon: 'fa-microchip' }
      ]
    },
    'screen-keyboard': {
      id: 'screen-keyboard',
      icon: 'fa-keyboard',
      titleEn: 'Screen, Keyboard & Laptop batteries Repair',
      titleAr: 'إصلاح شاشة ولوحة مفاتيح',
      shortDescEn: 'Professional screen replacement and keyboard repair services',
      shortDescAr: 'خدمات احترافية لاستبدال الشاشة وإصلاح لوحة المفاتيح',
      fullDescEn: `Get your laptop looking and working like new with our expert screen and keyboard repair services. We specialize in cracked screen replacement, dead pixel repair, keyboard key replacement, and trackpad fixes.

We use only high-quality original or OEM parts and provide fast turnaround times. Our technicians are experienced with all major brands including Dell, HP, Lenovo, Apple, ASUS, and Acer.`,
      fullDescAr: `اجعل جهاز اللابتوب الخاص بك يبدو ويعمل كالجديد من خلال خدمات إصلاح الشاشة ولوحة المفاتيح الاحترافية. نحن متخصصون في استبدال الشاشات المكسورة، إصلاح البكسلات الميتة، استبدال أزرار لوحة المفاتيح، وإصلاح لوحة اللمس.

نستخدم فقط قطع غيار عالية الجودة أصلية أو OEM ونوفر أوقات تسليم سريعة. فنيونا لديهم خبرة مع جميع العلامات التجارية الرئيسية بما في ذلك Dell و HP و Lenovo و Apple و ASUS و Acer.`,
      priceEn: 'Starting from 800 EGP',
      priceAr: 'تبدأ من 800 جنيه',
      durationEn: '2-4 hours',
      durationAr: '2-4 ساعات',
      warrantyEn: '3 months warranty',
      warrantyAr: 'ضمان 3 أشهر',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&h=600&fit=crop',
      features: [
        { en: 'Cracked screen replacement', ar: 'استبدال الشاشة المكسورة' },
        { en: 'Keyboard key repair', ar: 'إصلاح أزرار لوحة المفاتيح' },
        { en: 'Trackpad fix', ar: 'إصلاح لوحة اللمس' },
        { en: 'Dead pixel repair', ar: 'إصلاح البكسلات الميتة' },
        { en: 'Original parts', ar: 'قطع غيار أصلية' },
        { en: 'Fast service', ar: 'خدمة سريعة' }
      ],
      process: [
        { en: 'Diagnosis', ar: 'تشخيص المشكلة' },
        { en: 'Parts ordering', ar: 'طلب القطع' },
        { en: 'Professional repair', ar: 'إصلاح احترافي' },
        { en: 'Quality testing', ar: 'اختبار الجودة' },
        { en: 'Final inspection', ar: 'فحص نهائي' }
      ],
      faq: [
        {
          questionEn: 'How long does screen replacement take?',
          questionAr: 'كم يستغرق استبدال الشاشة؟',
          answerEn: 'Screen replacement typically takes 2-4 hours depending on the laptop model and parts availability. We offer express service for urgent cases.',
          answerAr: 'يستغرق استبدال الشاشة عادةً 2-4 ساعات اعتمادًا على موديل اللابتوب وتوفر القطع. نقدم خدمة سريعة للحالات العاجلة.'
        }
      ],
      relatedServices: [
        { id: 'hardware-upgrade', titleEn: 'Hardware Upgrade', titleAr: 'ترقية العتاد', icon: 'fa-microchip' },
        { id: 'system-tuneup', titleEn: 'System Tune-up', titleAr: 'تحسين النظام', icon: 'fa-chart-line' }
      ]
    },
    'system-tuneup': {
      id: 'system-tuneup',
      icon: 'fa-chart-line',
      titleEn: 'System Tune-up',
      titleAr: 'تحسين النظام',
      shortDescEn: 'Complete system optimization for maximum performance',
      shortDescAr: 'تحسين كامل للنظام للحصول على أقصى أداء',
      fullDescEn: `Give your computer a new lease on life with our comprehensive system tune-up service. We clean up junk files, optimize startup programs, update drivers, defragment hard drives, and fine-tune Windows settings for peak performance.

Whether your PC is running slow, crashing frequently, or just needs a spring cleaning, our tune-up service will restore it to like-new condition. We also offer OS reinstallation and migration services.`,
      fullDescAr: `امنح جهاز الكمبيوتر الخاص بك حياة جديدة من خلال خدمة تحسين النظام الشاملة. نقوم بتنظيف الملفات غير الضرورية، تحسين برامج بدء التشغيل، تحديث التعريفات، إلغاء تجزئة القرص الصلب، وضبط إعدادات Windows للحصول على أداء مثالي.

سواء كان جهاز الكمبيوتر الخاص بك يعمل ببطء، أو يتعطل بشكل متكرر، أو يحتاج فقط إلى تنظيف شامل، فإن خدمة التحسين الخاصة بنا ستعيده إلى حالة كالجديد. نقدم أيضًا خدمات إعادة تثبيت نظام التشغيل والترحيل.`,
      priceEn: 'Starting from 400 EGP',
      priceAr: 'تبدأ من 400 جنيه',
      durationEn: '2-3 hours',
      durationAr: '2-3 ساعات',
      warrantyEn: '30 days support',
      warrantyAr: '30 يوم دعم',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
      features: [
        { en: 'Faster boot time', ar: 'وقت تشغيل أسرع' },
        { en: 'Improved stability', ar: 'استقرار محسن' },
        { en: 'Latest drivers', ar: 'أحدث التعريفات' },
        { en: 'Clean system', ar: 'نظام نظيف' },
        { en: 'Better security', ar: 'أمان أفضل' },
        { en: 'Optimized settings', ar: 'إعدادات محسنة' }
      ],
      process: [
        { en: 'System diagnosis', ar: 'تشخيص النظام' },
        { en: 'Data backup', ar: 'نسخ احتياطي للبيانات' },
        { en: 'Cleanup & optimization', ar: 'تنظيف وتحسين' },
        { en: 'Driver updates', ar: 'تحديث التعريفات' },
        { en: 'Performance testing', ar: 'اختبار الأداء' }
      ],
      faq: [
        {
          questionEn: 'How often should I tune up my PC?',
          questionAr: 'كم مرة يجب أن أحسن أداء جهاز الكمبيوتر الخاص بي؟',
          answerEn: 'We recommend a professional tune-up every 6-12 months, or whenever you notice significant slowdowns or stability issues.',
          answerAr: 'نوصي بتحسين احترافي كل 6-12 شهرًا، أو كلما لاحظت بطءًا كبيرًا أو مشاكل في الاستقرار.'
        }
      ],
      relatedServices: [
        { id: 'virus-removal', titleEn: 'Virus Removal', titleAr: 'إزالة الفيروسات', icon: 'fa-shield-virus' },
        { id: 'hardware-upgrade', titleEn: 'Hardware Upgrade', titleAr: 'ترقية العتاد', icon: 'fa-microchip' }
      ]
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.markForCheck();
    });

    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const serviceId = params.get('id');
      this.loadService(serviceId);
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  toggleFaq(index: number): void {
    this.faqOpenStates[index] = !this.faqOpenStates[index];
    this.cdr.markForCheck();
  }

  loadService(id: string | null): void {
    this.loading = true;
    
    setTimeout(() => {
      if (id && this.servicesDatabase[id]) {
        this.service = this.servicesDatabase[id];
        this.faqOpenStates = new Array(this.service.faq.length).fill(false);
      } else {
        this.service = this.servicesDatabase['hardware-upgrade'];
        this.faqOpenStates = new Array(this.service.faq.length).fill(false);
      }
      this.loading = false;
      this.cdr.markForCheck();
    }, 300);
  }

  getWhatsAppMessage(): string {
    if (!this.service) return '';
    const message = this.currentLang === 'en' 
      ? `Hello 👋\n\nI'm interested in the "${this.service.titleEn}" service.\n\nPrice: ${this.service.priceEn}\nDuration: ${this.service.durationEn}\n\nPlease contact me with more details.`
      : `مرحباً 👋\n\nأنا مهتم بخدمة "${this.service.titleAr}"\n\nالسعر: ${this.service.priceAr}\nالمدة: ${this.service.durationAr}\n\nيرجى التواصل معي لمزيد من التفاصيل.`;
    return encodeURIComponent(message);
  }

  goToRelatedService(serviceId: string): void {
    this.router.navigate(['/service', serviceId]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}