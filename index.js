const { runCompranet } = require('./scrapers/compranetScraper');
const { runComprar } = require('./scrapers/comprarScraper');
const { runSicoes } = require('./scrapers/sicoesScraper');

require('dotenv').config();

(async () => {
  try {
    console.log('🔍 Iniciando scraping de licitaciones...');

    await runCompranet();
    await runComprar();
    await runSicoes();

    console.log('✅ Scraping finalizado con éxito.');
  } catch (error) {
    console.error('❌ Error durante la ejecución:', error.message);
  }
})();
