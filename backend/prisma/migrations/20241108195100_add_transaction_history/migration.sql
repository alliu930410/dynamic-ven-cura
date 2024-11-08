-- CreateTable
CREATE TABLE "TransactionHistory" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amountInEth" DECIMAL(65,30) NOT NULL,
    "custodialWalletId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransactionHistory_transactionHash_key" ON "TransactionHistory"("transactionHash");

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_custodialWalletId_fkey" FOREIGN KEY ("custodialWalletId") REFERENCES "CustodialWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
