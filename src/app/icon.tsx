import { ImageResponse } from 'next/og'
import * as fs from 'fs';
import * as path from 'path';
 
// Image metadata
export const alt = 'Zeneva POS & Inventory Management'
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  // Construct the path to the icon in the public folder
  const imagePath = path.join(process.cwd(), 'public', 'icon.png');
  // Read the image file as a buffer
  const imageBuffer = fs.readFileSync(imagePath);

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
         {/* Using an img tag with the buffer sourced directly */}
         <img width="32" height="32" src={imageBuffer as any} alt="Zeneva Icon"/>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons metadata
      ...size,
    }
  )
}
