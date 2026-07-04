require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

async function clean() {
  try {
    // 1. Fetch all images from DB
    const images = await prisma.image.findMany();
    console.log(`Found ${images.length} images in DB.`);

    // 2. Extract Cloudinary Public IDs
    // Example URL: https://res.cloudinary.com/dxfob5w5j/image/upload/v1734293849/k9sd9fj39sjfd.jpg
    const publicIds = [];
    for (const img of images) {
      if (img.url && img.url.includes('cloudinary.com')) {
        const parts = img.url.split('/');
        const filename = parts[parts.length - 1]; // e.g. k9sd9fj39sjfd.jpg
        const publicId = filename.split('.')[0]; // e.g. k9sd9fj39sjfd
        publicIds.push(publicId);
      }
    }

    // 3. Delete from Cloudinary
    if (publicIds.length > 0) {
      console.log(`Deleting ${publicIds.length} images from Cloudinary...`);
      for (const id of publicIds) {
        try {
          const result = await cloudinary.uploader.destroy(id);
          console.log(`Deleted ${id}:`, result);
        } catch (e) {
          console.error(`Failed to delete ${id}:`, e.message);
        }
      }
    } else {
      console.log('No Cloudinary images to delete.');
    }

    // 4. Delete from DB
    console.log('Clearing database...');
    await prisma.like.deleteMany({});
    await prisma.image.deleteMany({});
    console.log('Database cleared.');

  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await prisma.$disconnect();
  }
}

clean();
