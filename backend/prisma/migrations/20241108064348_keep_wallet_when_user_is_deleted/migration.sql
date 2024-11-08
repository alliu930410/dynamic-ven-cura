-- DropForeignKey
ALTER TABLE "CustodialWallet" DROP CONSTRAINT "CustodialWallet_userId_fkey";

-- AlterTable
ALTER TABLE "CustodialWallet" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CustodialWallet" ADD CONSTRAINT "CustodialWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
