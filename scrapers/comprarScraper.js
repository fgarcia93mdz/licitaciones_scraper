// scrapers/comprarScraper.js
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { sendLicitacionesEmail } = require('../utils/sendLicitacionesEmail');

const PROGRESS_PATH = path.join(__dirname, '../utils/progreso.json');
const DATA_PATH = path.join(__dirname, '../data/comprar.json');

async function runComprar() {
  const url = 'https://comprar.gob.ar/BuscarAvanzado.aspx';
  const progreso = await fs.readJSON(PROGRESS_PATH).catch(() => ({}));
  const lastHash = progreso['comprar'] || '';

  console.log('🔍 Buscando licitaciones en COMPRAR.gob.ar...');

  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  const licitaciones = [];
  let nuevoHash = '';

  $('tr.renglon_impar, tr.renglon_par').each((i, el) => {
    const cols = $(el).find('td');
    const nombre = $(cols[1]).text().trim();
    const link = 'https://comprar.gob.ar/' + $(cols[1]).find('a').attr('href');
    const entidad = $(cols[0]).text().trim();
    const fechaCierre = $(cols[3]).text().trim();

    const item = { nombre, entidad, fechaCierre, link };
    const hash = nombre + entidad + fechaCierre;

    if (!nuevoHash) nuevoHash = hash;
    if (hash === lastHash) return false;

    licitaciones.push(item);
  });

  if (licitaciones.length > 0) {
    await fs.outputJSON(DATA_PATH, licitaciones, { spaces: 2 });
    progreso['comprar'] = nuevoHash;
    await fs.writeJSON(PROGRESS_PATH, progreso, { spaces: 2 });
    await sendLicitacionesEmail('COMPRAR.gob.ar', licitaciones);
    console.log(`✅ ${licitaciones.length} nuevas licitaciones encontradas.`);
  } else {
    console.log('⚠️ No se encontraron nuevas licitaciones en COMPRAR.gob.ar');
  }
}

module.exports = { runComprar };
