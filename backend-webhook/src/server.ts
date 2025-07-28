import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import webhookRoutes from './routes/webhook';
import facebookAdsDataRoutes from './routes/facebookAdsData';
import facebookAdsRoutes from './routes/facebookAds';
import pedidosRoutes from './routes/pedidos';
import dashboardRoutes from './routes/dashboard';
import integracoesRoutes from './routes/integracoes';
import googleAdsRoutes from './routes/googleAds';
import googleAdsIntegrationRoutes from './routes/googleAdsIntegration';
import { initializeFacebookAdsCron } from './jobs/facebookAdsCron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/webhook', webhookRoutes);
app.use('/facebook-ads-data', facebookAdsDataRoutes);
app.use('/facebook-ads', facebookAdsRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/integracoes', integracoesRoutes);
app.use('/integracoes/google-ads', googleAdsIntegrationRoutes);
app.use('/google-ads', googleAdsRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Inicializar cron jobs
    initializeFacebookAdsCron();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

main();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});