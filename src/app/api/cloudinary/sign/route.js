import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary SDK automatically picks up CLOUDINARY_URL from process.env

export async function POST(req) {
  try {
    const paramsToSign = await req.json();
    const config = cloudinary.config();
    
    if (!config.api_secret) {
      return NextResponse.json({ error: 'API Secret missing' }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, config.api_secret);
    return NextResponse.json({ signature });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
