import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const count = await prisma.submission.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting submissions:', error);
    return NextResponse.json(
      { error: 'Error counting submissions' },
      { status: 500 }
    );
  }
} 