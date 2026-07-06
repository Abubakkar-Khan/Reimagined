import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await prisma.image.deleteMany({
      where: {
        title: {
          startsWith: 'Test API'
        }
      }
    });
    return NextResponse.json({ deleted: res.count });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
