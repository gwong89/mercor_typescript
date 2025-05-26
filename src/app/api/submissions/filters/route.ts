import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const filters = await prisma.submissionFilter.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(filters);
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const filter = await prisma.submissionFilter.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        minSalary: data.minSalary,
        maxSalary: data.maxSalary,
        workAvailability: data.workAvailability,
        minEducation: data.minEducation,
        skills: data.skills,
      },
    });
    return NextResponse.json(filter);
  } catch (error) {
    console.error('Error creating filter:', error);
    return NextResponse.json(
      { error: 'Failed to create filter' },
      { status: 500 }
    );
  }
} 