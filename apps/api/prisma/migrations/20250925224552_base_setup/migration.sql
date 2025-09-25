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
    "timestamp" BIGINT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

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

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_clubId_key" ON "public"."Address"("clubId");

-- AddForeignKey
ALTER TABLE "public"."Address" ADD CONSTRAINT "Address_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
