"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const webhook_1 = __importDefault(require("./routes/webhook"));
const facebookAdsData_1 = __importDefault(require("./routes/facebookAdsData"));
const facebookAds_1 = __importDefault(require("./routes/facebookAds"));
const pedidos_1 = __importDefault(require("./routes/pedidos"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const integracoes_1 = __importDefault(require("./routes/integracoes"));
const googleAds_1 = __importDefault(require("./routes/googleAds"));
const googleAdsIntegration_1 = __importDefault(require("./routes/googleAdsIntegration"));
const facebookAdsCron_1 = require("./jobs/facebookAdsCron");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
exports.prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/webhook', webhook_1.default);
app.use('/facebook-ads-data', facebookAdsData_1.default);
app.use('/facebook-ads', facebookAds_1.default);
app.use('/pedidos', pedidos_1.default);
app.use('/dashboard', dashboard_1.default);
app.use('/integracoes', integracoes_1.default);
app.use('/integracoes/google-ads', googleAdsIntegration_1.default);
app.use('/google-ads', googleAds_1.default);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
async function main() {
    try {
        await exports.prisma.$connect();
        console.log('✅ Database connected');
        // Inicializar cron jobs
        (0, facebookAdsCron_1.initializeFacebookAdsCron)();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}
main();
process.on('SIGINT', async () => {
    await exports.prisma.$disconnect();
    process.exit(0);
});
