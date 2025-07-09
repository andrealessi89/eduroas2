-- CreateTable
CREATE TABLE "FacebookAdsData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "conversions" DOUBLE PRECISION NOT NULL,
    "averageCpc" DOUBLE PRECISION NOT NULL,
    "conversionValue" DOUBLE PRECISION NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacebookAdsData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "custo" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idPedido" TEXT NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorFrete" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacebookAdsData_userId_date_idx" ON "FacebookAdsData"("userId", "date");

-- CreateIndex
CREATE INDEX "FacebookAdsData_receivedAt_idx" ON "FacebookAdsData"("receivedAt");

-- CreateIndex
CREATE INDEX "Produto_userId_idx" ON "Produto"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_userId_sku_key" ON "Produto"("userId", "sku");

-- CreateIndex
CREATE INDEX "Pedido_userId_idx" ON "Pedido"("userId");

-- CreateIndex
CREATE INDEX "Pedido_createdAt_idx" ON "Pedido"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_userId_idPedido_key" ON "Pedido"("userId", "idPedido");

-- AddForeignKey
ALTER TABLE "FacebookAdsData" ADD CONSTRAINT "FacebookAdsData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
