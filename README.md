# CarFixHub — Angular + Spring Boot

Fresh full-stack version of the Shahrukh Auto Care / CarFixHub enquiry application.

## Included

- Angular customer frontend
- Car brand dropdown with model dropdown
- Denting / Painting / Scratch Repair / Both
- Mandatory Indian 10-digit mobile validation
- Damage description with 1000-character counter
- Up to 3 damage photos
- 5 MB maximum per photo
- JPG / PNG / WebP validation
- Client-side image preview
- Direct Cloudinary image upload
- Spring Boot receives JSON with Cloudinary URLs
- PostgreSQL storage of enquiries
- Admin login
- Admin dashboard
- 10-second enquiry polling
- Browser notification for new enquiries
- Customer mobile / call button
- View and download damage photos
- Delete enquiry
- IST date/time display
- Success popup: “Your query has been submitted successfully. You will be contacted soon.”
- No email notification
- No image bytes stored in Render filesystem

## Cloudinary setup

1. Create a Cloudinary account.
2. Create an unsigned upload preset.
3. Restrict the preset to images and set a maximum file size such as 5 MB.
4. Open `frontend/src/app/core/app-config.ts`.
5. Replace:

```ts
cloudinaryCloudName: 'YOUR_CLOUD_NAME',
cloudinaryUploadPreset: 'YOUR_UPLOAD_PRESET',
```

with your values.

Never put a Cloudinary API secret in Angular code.

## Render setup

This repository contains a Render Blueprint and a Dockerfile.

The Blueprint creates:

- web service: `carfixhub`
- PostgreSQL database: `carfixhub-db`
- ADMIN_USERNAME and ADMIN_PASSWORD environment variables

The Spring Boot app reads the database environment variables already used by the existing application.

## Local development

Frontend:

```bash
cd frontend
npm install
npm start
```

Backend requires PostgreSQL environment variables. For a production-style deployment, use the Dockerfile at the repository root.

## Important photo behavior

Images are uploaded directly from the browser to Cloudinary. The backend stores only the secure image URLs. This avoids relying on Render's ephemeral filesystem.

The legacy-style `/admin.html` URL is also provided and redirects to the Angular `/admin` route.
