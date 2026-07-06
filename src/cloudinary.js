import { Cloudinary } from '@cloudinary/url-gen';

// Initialize Cloudinary
export const cld = new Cloudinary({
  cloud: {
    // TODO: Replace 'YOUR_CLOUD_NAME' with your actual Cloudinary Cloud Name
    cloudName: dcizelppo
  }
});
