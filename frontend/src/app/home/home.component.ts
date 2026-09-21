import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { APP_CONFIG } from '../core/app-config';
import { CloudinaryService } from '../core/cloudinary.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly api = inject(ApiService);
  private readonly cloudinary = inject(CloudinaryService);

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
    { value: 'Denting & Painting', label: '🚗 Both' }
  ];

  brand = '';
  model = '';
  service = '';
  mobile = '';
  description = '';
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  status = '';
  statusOk = false;
  sending = false;
  uploadText = 'Send Enquiry';

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

  async submit(): Promise<void> {
    this.status = '';

    if (!this.brand) return this.validation('Please select your car brand.', 'brand');
    if (!this.model) return this.validation('Please select your car model.', 'model');
    if (!this.service) return this.validation('Please select a service.', 'service');

    const mobile = this.mobile.replace(/\s+/g, '').trim();
    if (!/^[6-9]\d{9}$/.test(mobile)) return this.validation('Please enter a valid 10-digit Indian mobile number.', 'mobile');
    if (!this.description.trim()) return this.validation('Please describe the damage.', 'description');

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
        mobileNumber: mobile,
        description: this.description.trim(),
        photoName: this.selectedFiles.map(file => file.name).join(', '),
        photoUrl1: photoUrls[0] ?? '',
        photoUrl2: photoUrls[1] ?? '',
        photoUrl3: photoUrls[2] ?? ''
      }));

      alert('Your query has been submitted successfully. You will be contacted soon.');
      this.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to submit enquiry.';
      this.showError(message);
    } finally {
      this.sending = false;
      this.uploadText = 'Send Enquiry';
    }
  }

  private validation(message: string, id: string): void {
    this.showError(message);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById(id)?.focus();
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
    this.mobile = '';
    this.description = '';
    this.clearPreviews();
    this.selectedFiles = [];
    const fileInput = document.getElementById('photo') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
    this.status = '';
  }

  clearPreviews(): void {
    for (const url of this.previewUrls) URL.revokeObjectURL(url);
    this.previewUrls = [];
  }
}
