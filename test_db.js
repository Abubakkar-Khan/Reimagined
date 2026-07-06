const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const image = await prisma.image.create({
      data: { 
        url: "https://test.com", 
        title: "Test", 
        authorName: 'Anonymous', 
        email: "test@test.com", 
        slug: "test-slug-12345", 
        caption: "", 
        prompt: "" 
      },
    });
    console.log("Success:", image);
  } catch (e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
