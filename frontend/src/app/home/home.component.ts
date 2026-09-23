import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { APP_CONFIG } from '../core/app-config';
import { CloudinaryService } from '../core/cloudinary.service';
import { HeroAnimationComponent } from '../hero-animation/hero-animation.component';

interface Testimonial {
  name: string;
  car: string;
  rating: number;
  quote: string;
}

interface StatItem {
  label: string;
  target: number;
  suffix: string;
  current: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeroAnimationComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly cloudinary = inject(CloudinaryService);

  @ViewChild('statsSection') statsSection?: ElementRef<HTMLElement>;

  readonly currentYear = new Date().getFullYear();
  readonly ratingStars = [1, 2, 3, 4, 5];

  readonly carModels: Record<string, string[]> = {
    'Maruti Suzuki': ['Alto K10','S-Presso','Celerio','WagonR','Swift','Dzire','Baleno','Fronx','Brezza','Grand Vitara','Ertiga','XL6','Invicto','Jimny','Ignis','Eeco'],
    Hyundai: ['Grand i10 Nios','i20','i20 N Line','Aura','Exter','Venue','Venue N Line','Creta','Creta Electric','Verna','Alcazar','Tucson'],
    Tata: ['Tiago','Tiago EV','Tigor','Tigor EV','Altroz','Punch','Punch EV','Nexon','Nexon EV','Curvv','Curvv EV','Harrier','Harrier EV','Safari'],
    Mahindra: ['Bolero','Bolero Neo','Thar','Thar Roxx','Scorpio Classic','Scorpio N','XUV 3XO','XUV700','Marazzo','BE 6','XEV 9e'],
    Toyota: ['Glanza','Urban Cruiser Taisor','Urban Cruiser Hyryder','Rumion','Innova Crysta','Innova Hycross','Fortuner','Fortuner Legender','Hilux','Camry','Vellfire','Land Cruiser 300'],
    Honda: ['Amaze','City','Elevate'],
    Kia: ['Sonet','Seltos','Carens','Carens Clavis','Syros','Carnival'],
    'MG Motor': ['Comet EV','Windsor EV','Astor','Hector','Hector Plus','ZS EV','Gloster'],
    Renault: ['Kwid','Triber','Kiger'],
    Nissan: ['Magnite','X-Trail'],
    Volkswagen: ['Virtus','Taigun','Tiguan'],
    Skoda: ['Kylaq','Kushaq','Slavia','Kodiaq','Superb'],
    Jeep: ['Compass','Meridian','Wrangler','Grand Cherokee'],
    Citroen: ['C3','e-C3','C3 Aircross','C5 Aircross','Basalt'],
    BYD: ['Atto 3','Seal','eMAX 7','Sealion 7'],
    VinFast: ['VF6','VF7','VF8','VF9'],
    Isuzu: ['D-Max','MU-X'],
    BMW: ['2 Series','3 Series','5 Series','7 Series','X1','X3','X5','X7','i4','i5','i7','iX','XM'],
    'Mercedes-Benz': ['A-Class','C-Class','E-Class','S-Class','GLA','GLB','GLC','GLE','GLS','EQS','EQE','V-Class','Maybach S-Class','Maybach GLS'],
    Audi: ['A4','A6','A8 L','Q3','Q5','Q7','Q8','Q8 e-tron','e-tron GT'],
    Volvo: ['XC40','XC60','XC90','EX30','EX40','EX90','S90'],
    Jaguar: ['F-Pace','F-Type','I-Pace','XF'],
    'Land Rover': ['Defender','Discovery','Discovery Sport','Range Rover','Range Rover Sport','Range Rover Velar','Range Rover Evoque'],
    Lexus: ['ES','LM','LS','NX','RX','LX','LC'],
    Porsche: ['718 Cayman','718 Boxster','911','Macan','Cayenne','Panamera','Taycan'],
    MINI: ['Cooper','Countryman','Cooper S'],
    Lamborghini: ['Urus','Revuelto','Huracan'],
    Ferrari: ['Roma','296 GTB','296 GTS','SF90','Purosangue'],
    'Rolls-Royce': ['Ghost','Phantom','Cullinan','Spectre'],
    Bentley: ['Continental GT','Flying Spur','Bentayga'],
    'Aston Martin': ['DB12','Vanquish','Vantage','DBX'],
    Maserati: ['Grecale','Levante','Ghibli','Quattroporte','GranTurismo','GranCabrio'],
    Tesla: ['Model 3','Model Y'],
    Other: ['Other / Different Model']
  };

  readonly brands = Object.keys(this.carModels);
  readonly services = [
    { value: 'Denting', label: '🔨 Denting' },
    { value: 'Painting', label: '🎨 Painting' },
    { value: 'Scratch Repair', label: '✨ Scratch Repair' },
    { value: 'Denting & Painting', label: '🚗 All' }
  ];

  // ===== Enquiry form =====
  brand = '';
  model = '';
  service = '';
  customerName = '';
  mobile = '';
  description = '';
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  status = '';
  statusOk = false;
  sending = false;
  uploadText = 'Send Enquiry';

  // ===== Form wizard =====
  currentStep = 1;
  readonly totalSteps = 3;
  readonly stepLabels = ['Your Car', 'The Damage', 'Contact Info'];

  // ===== Success modal =====
  showSuccessModal = false;
  lastCustomerName = '';
  lastMobile = '';

  // ===== Testimonials =====
  readonly testimonials: Testimonial[] = [
    { name: 'Rohit Sharma', car: 'Hyundai Creta', rating: 5, quote: "The dent on my bumper looked factory-new after CarFixHub was done. You genuinely can't tell it was ever damaged." },
    { name: 'Ayesha Khan', car: 'Maruti Baleno', rating: 5, quote: 'Quick turnaround and the paint match was perfect on the first try. Very professional team throughout.' },
    { name: 'Vikram Singh', car: 'Tata Nexon', rating: 4, quote: 'Fair, honest pricing — they only fixed what actually needed fixing instead of upselling extra work.' },
    { name: 'Neha Gupta', car: 'Honda City', rating: 5, quote: 'Sent a few photos on WhatsApp, had a quote within minutes, and the finish is spotless. Highly recommend.' }
  ];
  activeTestimonial = 0;
  private testimonialTimer?: ReturnType<typeof setInterval>;

  // ===== Stats strip =====
  stats: StatItem[] = [
    { label: 'Cars Repaired', target: 500, suffix: '+', current: 0 },
    { label: 'Years Experience', target: 10, suffix: '+', current: 0 },
    { label: 'Average Rating', target: 4.8, suffix: '★', current: 0 },
    { label: 'Same-Day Quotes', target: 95, suffix: '%', current: 0 }
  ];
  private statsAnimated = false;
  private statsObserver?: IntersectionObserver;

  // ===== Before / after gallery =====
  // Illustrated placeholder comparison — swap the SVGs in home.component.html
  // for real <img> photos of your own repair work as soon as you have them.
  sliderPosition = 50;

  ngAfterViewInit(): void {
    if (this.statsSection) {
      this.statsObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !this.statsAnimated) {
              this.statsAnimated = true;
              this.animateStats();
            }
          });
        },
        { threshold: 0.4 }
      );
      this.statsObserver.observe(this.statsSection.nativeElement);
    }

    this.startTestimonialAutoplay();
  }

  ngOnDestroy(): void {
    this.statsObserver?.disconnect();
    this.stopTestimonialAutoplay();
  }

  private animateStats(): void {
    const duration = 1400;
    const start = performance.now();
    const targets = this.stats.map(s => s.target);

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.stats.forEach((stat, i) => {
        stat.current = Math.round(targets[i] * eased * 10) / 10;
      });

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        this.stats.forEach((stat, i) => (stat.current = targets[i]));
      }
    };

    requestAnimationFrame(tick);
  }

  // ===== Testimonials controls =====
  startTestimonialAutoplay(): void {
    this.stopTestimonialAutoplay();
    this.testimonialTimer = setInterval(() => this.nextTestimonial(), 5000);
  }

  stopTestimonialAutoplay(): void {
    if (this.testimonialTimer) clearInterval(this.testimonialTimer);
  }

  nextTestimonial(): void {
    this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
  }

  prevTestimonial(): void {
    this.activeTestimonial = (this.activeTestimonial - 1 + this.testimonials.length) % this.testimonials.length;
  }

  goToTestimonial(i: number): void {
    this.activeTestimonial = i;
    this.startTestimonialAutoplay();
  }

  // ===== Existing form logic =====
  onSliderInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.sliderPosition = Number(input.value);
  }

  onBrandChange(): void {
    this.model = '';
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.clearPreviews();

    if (files.length > APP_CONFIG.maxPhotos) {
      input.value = '';
      this.selectedFiles = [];
      this.showError(`You can upload a maximum of ${APP_CONFIG.maxPhotos} pictures.`);
      return;
    }

    const invalid = files.find(file => file.size > APP_CONFIG.maxPhotoSizeBytes);
    if (invalid) {
      input.value = '';
      this.selectedFiles = [];
      this.showError(`${invalid.name} is larger than 5 MB.`);
      return;
    }

    const badType = files.find(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
    if (badType) {
      input.value = '';
      this.selectedFiles = [];
      this.showError('Only JPG, PNG and WebP pictures are allowed.');
      return;
    }

    this.selectedFiles = files;
    this.previewUrls = files.map(file => URL.createObjectURL(file));
    this.status = '';
  }

  selectService(value: string): void {
    this.service = value;
  }

  removePhoto(index: number): void {
    URL.revokeObjectURL(this.previewUrls[index]);
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  // ===== Wizard navigation =====
  nextStep(): void {
    if (!this.validateStep(this.currentStep)) return;
    if (this.currentStep < this.totalSteps) this.currentStep++;
    document.getElementById('repairForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(step: number): void {
    if (step < this.currentStep) this.currentStep = step;
  }

  private validateStep(step: number): boolean {
    this.status = '';

    if (step === 1) {
      if (!this.brand) return this.fail('Please select your car brand.', 'brand');
      if (!this.model) return this.fail('Please select your car model.', 'model');
    }

    if (step === 2) {
      if (!this.service) return this.fail('Please select a service.', 'service');
      if (!this.description.trim()) return this.fail('Please describe the damage.', 'description');
    }

    if (step === 3) {
      const mobile = this.mobile.replace(/\s+/g, '').trim();
      if (!/^[6-9]\d{9}$/.test(mobile)) return this.fail('Please enter a valid 10-digit Indian mobile number.', 'mobile');
    }

    return true;
  }

  private fail(message: string, id: string): boolean {
    this.showError(message);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById(id)?.focus();
    return false;
  }

  async submit(): Promise<void> {
    for (let step = 1; step <= this.totalSteps; step++) {
      if (!this.validateStep(step)) {
        this.currentStep = step;
        return;
      }
    }

    if (this.selectedFiles.length > APP_CONFIG.maxPhotos) {
      this.showError(`You can upload a maximum of ${APP_CONFIG.maxPhotos} pictures.`);
      return;
    }

    this.sending = true;
    this.uploadText = this.selectedFiles.length ? 'Uploading photos...' : 'Sending...';

    try {
      const photoUrls: string[] = [];
      for (const file of this.selectedFiles) {
        if (APP_CONFIG.cloudinaryCloudName === 'YOUR_CLOUD_NAME' || APP_CONFIG.cloudinaryUploadPreset === 'YOUR_UPLOAD_PRESET') {
          throw new Error('Cloudinary is not configured yet. Add your Cloud Name and Upload Preset in app-config.ts.');
        }
        photoUrls.push(await this.cloudinary.upload(file));
      }

      this.uploadText = 'Sending...';
      await firstValueFrom(this.api.submitEnquiry({
        carModel: `${this.brand} - ${this.model}`,
        serviceType: this.service,
        customerName: this.customerName.trim(),
        mobileNumber: this.mobile.replace(/\s+/g, '').trim(),
        description: this.description.trim(),
        photoName: this.selectedFiles.map(file => file.name).join(', '),
        photoUrl1: photoUrls[0] ?? '',
        photoUrl2: photoUrls[1] ?? '',
        photoUrl3: photoUrls[2] ?? ''
      }));

      this.lastCustomerName = this.customerName.trim();
      this.lastMobile = this.mobile.replace(/\s+/g, '').trim();
      this.showSuccessModal = true;
      this.reset();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to submit enquiry.';
      this.showError(message);
    } finally {
      this.sending = false;
      this.uploadText = 'Send Enquiry';
    }
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private showError(message: string): void {
    this.status = message;
    this.statusOk = false;
    setTimeout(() => document.getElementById('status')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  }

  reset(): void {
    this.brand = '';
    this.model = '';
    this.service = '';
    this.customerName = '';
    this.mobile = '';
    this.description = '';
    this.clearPreviews();
    this.selectedFiles = [];
    this.currentStep = 1;
    this.status = '';
  }

  clearPreviews(): void {
    for (const url of this.previewUrls) URL.revokeObjectURL(url);
    this.previewUrls = [];
  }

  // ===== Section navigation =====
  scrollTo(id: string): void {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToForm(): void { this.scrollTo('repairForm'); }
  scrollToServices(): void { this.scrollTo('services'); }
  scrollToGallery(): void { this.scrollTo('gallery'); }
  scrollToReviews(): void { this.scrollTo('reviews'); }
  scrollToTop(): void { this.scrollTo('top'); }
}
