
// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey || apiKey === "YOUR_IMGBB_API_KEY") {
    console.error("ImgBB API key is not configured in .env file.");
    return NextResponse.json(
      { error: 'Image upload service is not configured on the server.' },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Create a new FormData to send to ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', image);
    
    // ImgBB API endpoint
    const imgbbUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
    
    const response = await fetch(imgbbUrl, {
      method: 'POST',
      body: imgbbFormData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('ImgBB API Error:', result);
      throw new Error(result.error?.message || 'Failed to upload image to ImgBB.');
    }

    // Return the URL of the uploaded image
    return NextResponse.json({ url: result.data.url }, { status: 200 });

  } catch (error) {
    console.error('Error in image upload route:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
