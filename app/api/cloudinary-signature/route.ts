import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp: timestamp },
      process.env.CLOUDINARY_API_SECRET as string
    );
    return NextResponse.json({ signature, timestamp });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}