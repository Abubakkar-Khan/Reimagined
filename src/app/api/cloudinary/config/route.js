import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary SDK automatically picks up CLOUDINARY_URL from process.env

export async function GET() {
  const config = cloudinary.config();
  
  if (!config.cloud_name || !config.api_key) {
    return NextResponse.json({ error: 'Cloudinary config missing' }, { status: 500 });
  }

  return NextResponse.json({
    cloudName: config.cloud_name,
    apiKey: config.api_key
  });
}
