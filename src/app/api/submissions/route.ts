import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EDUCATION_LEVELS = [
  'High School Diploma',
  'Associate\'s Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate',
];

function getEducationRank(level: string) {
  return EDUCATION_LEVELS.indexOf(level);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const filterId = searchParams.get('filter');

    let submissions = await prisma.submission.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        workExperiences: true,
        education: {
          include: {
            degrees: true,
          },
        },
        skills: true,
      },
    });
    console.debug('Initial submissions count:', submissions.length);

    if (filterId) {
      const filter = await prisma.submissionFilter.findUnique({
        where: { id: parseInt(filterId) },
      });
      console.debug('Loaded filter object:', filter);

      if (filter) {
        // 1. Location
        if (filter.location) {
          const before = submissions.length;
          submissions = submissions.filter((sub: any) => sub.location === filter.location);
          console.debug('Location filter:', filter.location, 'Before:', before, 'After:', submissions.length);
        }
        // 2. Salary
        if (filter.minSalary || filter.maxSalary) {
          const before = submissions.length;
          submissions = submissions.filter((sub: any, idx: number) => {
            let salaryStr = sub.annualSalaryExpectation?.['full-time'];
            if (!salaryStr) {
              const firstKey = Object.keys(sub.annualSalaryExpectation || {})[0];
              salaryStr = sub.annualSalaryExpectation?.[firstKey];
            }
            if (!salaryStr) {
              return false;
            }
            // Remove dollar sign, commas, and whitespace
            const sanitized = salaryStr.replace(/[$,\s]/g, '');
            const salary = parseInt(sanitized);
            if (isNaN(salary)) {
              return false;
            }
            if (filter.minSalary !== undefined && filter.minSalary !== null && salary < filter.minSalary) {
              return false;
            }
            if (filter.maxSalary !== undefined && filter.maxSalary !== null && salary > filter.maxSalary) {
              return false;
            }
            return true;
          });
          console.debug('Salary filter:', { min: filter.minSalary, max: filter.maxSalary }, 'Before:', before, 'After:', submissions.length);
        }
        // 3. Work Availability
        if (filter.workAvailability && filter.workAvailability.length > 0) {
          const before = submissions.length;
          submissions = submissions.filter((sub: any) =>
            sub.workAvailability.some((wa: string) =>
              filter.workAvailability.map((f: string) => f.toLowerCase()).includes(wa.toLowerCase())
            )
          );
          console.debug('Work Availability filter:', filter.workAvailability, 'Before:', before, 'After:', submissions.length);
        }
        // 4. Education (hierarchical)
        if (filter.minEducation) {
          const minRank = EDUCATION_LEVELS.indexOf(filter.minEducation);
          const before = submissions.length;
          submissions = submissions.filter((sub: any) => {
            const level = sub.education?.highestLevel;
            const rank = level ? EDUCATION_LEVELS.indexOf(level) : -1;
            // Only include if both minRank and rank are found and rank >= minRank
            return minRank !== -1 && rank !== -1 && rank >= minRank;
          });
          console.debug('Education filter:', filter.minEducation, 'Before:', before, 'After:', submissions.length);
        }
        // 5. Skills
        if (filter.skills && filter.skills.length > 0) {
          const before = submissions.length;
          submissions = submissions.filter((sub: any) =>
            sub.skills.some((skill: any) => filter.skills.includes(skill.name))
          );
          console.debug('Skills filter:', filter.skills, 'Before:', before, 'After:', submissions.length);
        }
      }
    }
    console.debug('Final submissions count:', submissions.length);

    const total = submissions.length;
    const paginated = submissions.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      submissions: paginated,
      pagination: {
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
} 