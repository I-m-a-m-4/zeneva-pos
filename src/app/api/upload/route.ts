
// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

const isImageKitConfigured = 
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT &&
    !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY.startsWith("YOUR_");

export async function POST(request: Request) {
  if (!isImageKitConfigured) {
    console.error("ImageKit is not configured in .env file.");
    return NextResponse.json(
      { error: 'Image upload service is not configured on the server.' },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Convert the file to a buffer to upload to ImageKit
    const buffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    const response = await imagekit.upload({
        file: imageBuffer,
        fileName: imageFile.name,
        folder: "/zeneva_products/", // Optional: organize uploads into folders
        useUniqueFileName: true,
    });

    return NextResponse.json({ url: response.url }, { status: 200 });

  } catch (error) {
    console.error('Error in ImageKit upload route:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
