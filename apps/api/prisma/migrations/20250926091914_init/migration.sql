-- CreateTable
CREATE TABLE "public"."Club" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "qrCodeSuffixConfig" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "clubId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClubOccupancy" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubOccupancy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Club_clubId_key" ON "public"."Club"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_clubId_key" ON "public"."Address"("clubId");

-- CreateIndex
CREATE INDEX "ClubOccupancy_clubId_createdAt_idx" ON "public"."ClubOccupancy"("clubId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubOccupancy" ADD CONSTRAINT "ClubOccupancy_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("clubId") ON DELETE CASCADE ON UPDATE CASCADE;
