import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to convert empty strings to "N/A"
const convertEmptyToNA = (value: string | null | undefined): string => {
  if (!value || value.trim() === '') return 'N/A';
  return value;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const submissions = JSON.parse(text);

    // Process each submission
    for (const submission of submissions) {
      // Create the main submission record
      const newSubmission = await prisma.submission.create({
        data: {
          name: convertEmptyToNA(submission.name),
          email: convertEmptyToNA(submission.email),
          phone: convertEmptyToNA(submission.phone),
          location: convertEmptyToNA(submission.location),
          submittedAt: new Date(submission.submitted_at),
          workAvailability: submission.work_availability,
          annualSalaryExpectation: submission.annual_salary_expectation,
          // Create related records
          workExperiences: {
            create: submission.work_experiences.map((exp: any) => ({
              company: convertEmptyToNA(exp.company),
              roleName: convertEmptyToNA(exp.roleName),
            })),
          },
          education: submission.education ? {
            create: {
              highestLevel: convertEmptyToNA(submission.education.highest_level),
              degrees: {
                create: submission.education.degrees.map((degree: any) => ({
                  degree: convertEmptyToNA(degree.degree),
                  subject: convertEmptyToNA(degree.subject),
                  school: convertEmptyToNA(degree.school),
                  gpa: convertEmptyToNA(degree.gpa),
                  startDate: convertEmptyToNA(degree.startDate),
                  endDate: convertEmptyToNA(degree.endDate),
                  originalSchool: convertEmptyToNA(degree.originalSchool),
                  isTop50: degree.isTop50 ?? false,
                  isTop25: degree.isTop25 ?? false,
                })),
              },
            },
          } : undefined,
          skills: {
            create: submission.skills.map((skill: string) => ({
              name: convertEmptyToNA(skill),
            })),
          },
        },
      });
    }

    return NextResponse.json({ 
      message: 'File processed successfully',
      count: submissions.length 
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
} 