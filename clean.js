const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  try {
    const res = await prisma.image.deleteMany({
      where: {
        title: 'Test API 3',
        authorName: 'Tester 3'
      }
    });
    console.log('Deleted rows:', res.count);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

clean();
