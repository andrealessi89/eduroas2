-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN "codigo" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "valorProduto" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "valorDesconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "pessoaNome" TEXT NOT NULL DEFAULT '',
ADD COLUMN "pessoaEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN "formaPagamento" TEXT NOT NULL DEFAULT '',
ADD COLUMN "situacao" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "situacaoDescricao" TEXT NOT NULL DEFAULT '',
ADD COLUMN "cupomCodigo" TEXT,
ADD COLUMN "cupomDesconto" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Remove defaults after adding columns
ALTER TABLE "Pedido" ALTER COLUMN "codigo" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "dataHora" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "valorProduto" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "valorDesconto" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "pessoaNome" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "pessoaEmail" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "formaPagamento" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "situacao" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "situacaoDescricao" DROP DEFAULT;

-- CreateTable
CREATE TABLE "PedidoItem" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "produtoDerivacaoId" INTEGER NOT NULL,
    "produtoDerivacaoCodigo" TEXT NOT NULL,
    "produtoNome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "valorDesconto" DOUBLE PRECISION NOT NULL,
    "valorItem" DOUBLE PRECISION NOT NULL,
    "custoUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lucroItem" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PedidoItem_pedidoId_idx" ON "PedidoItem"("pedidoId");

-- CreateIndex
CREATE INDEX "PedidoItem_produtoDerivacaoCodigo_idx" ON "PedidoItem"("produtoDerivacaoCodigo");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_codigo_key" ON "Pedido"("codigo");

-- CreateIndex
CREATE INDEX "Pedido_situacao_idx" ON "Pedido"("situacao");

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;