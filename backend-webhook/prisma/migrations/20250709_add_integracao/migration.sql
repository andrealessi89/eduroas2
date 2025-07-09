-- CreateTable
CREATE TABLE "Integracao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integracao_userId_tipo_key" ON "Integracao"("userId", "tipo");

-- CreateIndex
CREATE INDEX "Integracao_userId_idx" ON "Integracao"("userId");

-- AddForeignKey
ALTER TABLE "Integracao" ADD CONSTRAINT "Integracao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;