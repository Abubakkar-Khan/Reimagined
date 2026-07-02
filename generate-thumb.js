const sharp = require('sharp');
const fs = require('fs');

async function createThumbnail() {
  const imagePath = 'public/Street View 360.jpg';
  const outputPath = 'public/original-thumb.jpg';
  
  try {
    const metadata = await sharp(imagePath).metadata();
    
    // Calculate the center crop for a typical 4:3 or 16:9 thumbnail ratio
    // We'll extract an 800x600 window from the exact center
    const extractWidth = Math.floor(metadata.width * 0.25); // 25% of width
    const extractHeight = Math.floor(metadata.height * 0.35); // 35% of height
    
    const left = Math.floor((metadata.width - extractWidth) / 2);
    const top = Math.floor((metadata.height - extractHeight) / 2);
    
    await sharp(imagePath)
      .extract({ left, top, width: extractWidth, height: extractHeight })
      .resize(800, 600, { fit: 'cover' })
      .toFile(outputPath);
      
    console.log('Thumbnail created successfully!');
  } catch (err) {
    console.error('Error creating thumbnail:', err);
  }
}

createThumbnail();
