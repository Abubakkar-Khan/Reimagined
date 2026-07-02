import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT = 5; // Max 5 uploads per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    // We'll also return whether the current session has liked each image
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('sessionId')?.value;

    let userLikes = [];
    if (sessionId) {
      const likes = await prisma.like.findMany({
        where: { sessionId },
        select: { imageId: true },
      });
      userLikes = likes.map((l) => l.imageId);
    }

    const formattedImages = images.map((img) => ({
      id: img.id,
      url: img.url,
      title: img.title,
      authorName: img.authorName,
      caption: img.caption,
      prompt: img.prompt,
      createdAt: img.createdAt,
      likesCount: img._count.likes,
      hasLiked: userLikes.includes(img.id),
    }));

    // Generate a session ID if one doesn't exist
    const response = NextResponse.json(formattedImages);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Basic IP rate limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    
    if (rateLimitMap.has(ip)) {
      const entry = rateLimitMap.get(ip);
      if (now - entry.timestamp < RATE_LIMIT_WINDOW) {
        if (entry.count >= RATE_LIMIT) {
          return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
        }
        entry.count++;
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }

    // Clean up old entries occasionally
    if (Math.random() < 0.1) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (now - value.timestamp > RATE_LIMIT_WINDOW) {
          rateLimitMap.delete(key);
        }
      }
    }

    const body = await req.json();
    const { url, title, authorName, caption, prompt } = body;

    if (!url || !title) {
      return NextResponse.json({ error: 'URL and title are required' }, { status: 400 });
    }

    const image = await prisma.image.create({
      data: { url, title, authorName: authorName || 'Anonymous', caption, prompt },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Failed to save image:', error);
    return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
  }
}
