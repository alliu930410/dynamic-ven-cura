-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "dynamicUserId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustodialWallet" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "privateKeyVI" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CustodialWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_dynamicUserId_key" ON "User"("dynamicUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CustodialWallet_address_key" ON "CustodialWallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "CustodialWallet_privateKey_key" ON "CustodialWallet"("privateKey");

-- CreateIndex
CREATE UNIQUE INDEX "CustodialWallet_privateKeyVI_key" ON "CustodialWallet"("privateKeyVI");

-- AddForeignKey
ALTER TABLE "CustodialWallet" ADD CONSTRAINT "CustodialWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
