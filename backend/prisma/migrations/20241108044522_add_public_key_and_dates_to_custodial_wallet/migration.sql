/*
  Warnings:

  - A unique constraint covering the columns `[publicKey]` on the table `CustodialWallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicKey` to the `CustodialWallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CustodialWallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustodialWallet" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "publicKey" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CustodialWallet_publicKey_key" ON "CustodialWallet"("publicKey");
