import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from './app-config';

interface CloudinaryResponse {
  secure_url?: string;
  error?: { message?: string };
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly http = inject(HttpClient);

  async upload(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${APP_CONFIG.cloudinaryCloudName}/image/upload`;
    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', APP_CONFIG.cloudinaryUploadPreset);
    if (APP_CONFIG.cloudinaryFolder) body.append('folder', APP_CONFIG.cloudinaryFolder);

    const response = await firstValueFrom(
      this.http.post<CloudinaryResponse>(url, body)
    );

    if (!response.secure_url) {
      throw new Error(response.error?.message || 'Photo upload failed.');
    }

    return response.secure_url;
  }
}

