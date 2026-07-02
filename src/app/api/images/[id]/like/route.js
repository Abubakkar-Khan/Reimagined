import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  try {
    const { id: imageId } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session not found. Please refresh.' }, { status: 400 });
    }

    // Check if the like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        sessionId_imageId: {
          sessionId,
          imageId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          sessionId,
          imageId,
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Failed to toggle like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
