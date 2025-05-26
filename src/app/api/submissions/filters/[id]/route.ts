import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.submissionFilter.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting filter:', error);
    return NextResponse.json(
      { error: 'Failed to delete filter' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const updated = await prisma.submissionFilter.update({
      where: { id: parseInt(params.id) },
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
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating filter:', error);
    return NextResponse.json(
      { error: 'Failed to update filter' },
      { status: 500 }
    );
  }
} 