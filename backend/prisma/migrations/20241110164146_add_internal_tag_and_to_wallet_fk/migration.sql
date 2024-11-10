-- AlterTable
ALTER TABLE "TransactionHistory" ADD COLUMN     "isInternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "toCustodialWalletId" INTEGER;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_toCustodialWalletId_fkey" FOREIGN KEY ("toCustodialWalletId") REFERENCES "CustodialWallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
