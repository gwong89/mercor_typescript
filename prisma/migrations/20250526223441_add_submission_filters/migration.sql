-- CreateTable
CREATE TABLE "submission_filters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "minSalary" INTEGER,
    "maxSalary" INTEGER,
    "workAvailability" TEXT[],
    "minEducation" TEXT,
    "skills" TEXT[],

    CONSTRAINT "submission_filters_pkey" PRIMARY KEY ("id")
);
