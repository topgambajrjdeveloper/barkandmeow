-- CreateTable
CREATE TABLE "HealthCard" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,

    CONSTRAINT "HealthCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" TEXT NOT NULL,
    "healthCardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "veterinarian" TEXT,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "healthCardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "healthCardId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "veterinarian" TEXT,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passport" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "issuingCountry" TEXT NOT NULL,
    "microchipNumber" TEXT,

    CONSTRAINT "Passport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HealthCard_petId_key" ON "HealthCard"("petId");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_petId_key" ON "Passport"("petId");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_passportNumber_key" ON "Passport"("passportNumber");

-- AddForeignKey
ALTER TABLE "HealthCard" ADD CONSTRAINT "HealthCard_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_healthCardId_fkey" FOREIGN KEY ("healthCardId") REFERENCES "HealthCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_healthCardId_fkey" FOREIGN KEY ("healthCardId") REFERENCES "HealthCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_healthCardId_fkey" FOREIGN KEY ("healthCardId") REFERENCES "HealthCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passport" ADD CONSTRAINT "Passport_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
