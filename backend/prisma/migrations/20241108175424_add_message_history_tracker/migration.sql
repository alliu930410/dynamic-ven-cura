-- CreateTable
CREATE TABLE "MessageHistory" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "signatureVI" TEXT NOT NULL,
    "custodialWalletId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MessageHistory" ADD CONSTRAINT "MessageHistory_custodialWalletId_fkey" FOREIGN KEY ("custodialWalletId") REFERENCES "CustodialWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
