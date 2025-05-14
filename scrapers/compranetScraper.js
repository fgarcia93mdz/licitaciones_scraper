const puppeteer = require('puppeteer');
const { saveData } = require('../utils/saveData');
const { sendLicitacionesEmail } = require('../utils/sendLicitacionesEmail');
const path = require('path');
const fs = require('fs-extra');

const runCompranet = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--ignore-certificate-errors'],
    ignoreHTTPSErrors: true
  });
  
  const page = await browser.newPage();

  const results = [];

  try {
    await page.goto('https://compranet.hacienda.gob.mx/', { timeout: 60000 });

    // Aquí iría el scraping real — simulamos con datos de ejemplo
    results.push({
      titulo: 'Suministro de extintores',
      entidad: 'Gobierno de México',
      fecha: '2025-05-14',
      link: 'https://compranet.hacienda.gob.mx/example1'
    });

    await saveData('compranet', results);

    if (results.length > 0) {
      await sendLicitacionesEmail('Compranet', results);
    }
    
    console.log('✅ Datos guardados desde Compranet.');
  } catch (err) {
    console.error('❌ Error en Compranet:', err.message);
  } finally {
    await browser.close();
  }
};

module.exports = { runCompranet };
