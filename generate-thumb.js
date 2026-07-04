const sharp = require('sharp');
const fs = require('fs');

async function createThumbnail() {
  const imagePath = 'public/IIUI_360.png';
  const outputPath = 'public/original-thumb.jpg';
  
  try {
    const metadata = await sharp(imagePath).metadata();
    
    await sharp(imagePath)
      .resize(800) // resize width to 800px, maintain aspect ratio
      .jpeg({ quality: 80 }) // compress the image
      .toFile(outputPath);
      
    console.log('Thumbnail created successfully!');
  } catch (err) {
    console.error('Error creating thumbnail:', err);
  }
}

createThumbnail();
