require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function cleanCloudinary() {
  try {
    const result = await cloudinary.api.resources({ type: 'upload', max_results: 500 });
    const publicIds = result.resources.map(r => r.public_id);
    
    if (publicIds.length > 0) {
      console.log(`Deleting ${publicIds.length} images from Cloudinary...`);
      for (let i = 0; i < publicIds.length; i += 100) {
        const chunk = publicIds.slice(i, i + 100);
        const deleteResult = await cloudinary.api.delete_resources(chunk);
        console.log(`Deleted chunk ${i/100 + 1}:`, deleteResult);
      }
    } else {
      console.log('No Cloudinary images to delete.');
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

cleanCloudinary();
