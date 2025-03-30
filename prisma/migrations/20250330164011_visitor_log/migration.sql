-- CreateTable
CREATE TABLE "VisitorLog" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "city" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitorLog_visitorId_idx" ON "VisitorLog"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorLog_date_idx" ON "VisitorLog"("date");

-- CreateIndex
CREATE INDEX "VisitorLog_country_idx" ON "VisitorLog"("country");

-- CreateIndex
CREATE INDEX "VisitorLog_deviceType_idx" ON "VisitorLog"("deviceType");
