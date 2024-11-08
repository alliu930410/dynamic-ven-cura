/*
  Warnings:

  - You are about to drop the column `privateKeyVI` on the `CustodialWallet` table. All the data in the column will be lost.
  - You are about to drop the column `signatureVI` on the `MessageHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[privateKeyIV]` on the table `CustodialWallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `privateKeyIV` to the `CustodialWallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signatureIV` to the `MessageHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CustodialWallet_privateKeyVI_key";

-- AlterTable
ALTER TABLE "CustodialWallet" DROP COLUMN "privateKeyVI",
ADD COLUMN     "privateKeyIV" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MessageHistory" DROP COLUMN "signatureVI",
ADD COLUMN     "signatureIV" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CustodialWallet_privateKeyIV_key" ON "CustodialWallet"("privateKeyIV");
