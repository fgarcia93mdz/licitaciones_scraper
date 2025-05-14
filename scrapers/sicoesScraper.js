const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const { sendLicitacionesEmail } = require('../utils/sendLicitacionesEmail');

const progresoPath = path.join(__dirname, '../utils/progreso.json');
const dataPath = path.join(__dirname, '../data/sicoes_results.json');

async function runSicoes() {
  console.log('🔍 Ejecutando scraper para SICOES Bolivia...');

  const baseURL = 'https://www.sicoes.gob.bo/';
  const searchURL = `${baseURL}portal/index.php?option=com_procBusqueda&task=busquedaAvanzada`;

  const resultados = [];

  try {
    const { data } = await axios.get(searchURL);
    const $ = cheerio.load(data);

    $('table.resultados tbody tr').each((_, el) => {
      const cols = $(el).find('td');
      const codigo = $(cols[0]).text().trim();
      const entidad = $(cols[1]).text().trim();
      const objeto = $(cols[2]).text().trim();
      const estado = $(cols[3]).text().trim();
      const link = baseURL + ($(cols[2]).find('a').attr('href') || '');

      resultados.push({ codigo, entidad, objeto, estado, link });
    });

    await fs.outputJSON(dataPath, resultados, { spaces: 2 });
    console.log(`✅ ${resultados.length} licitaciones guardadas desde SICOES.`);

    if (resultados.length > 0) {
      await sendLicitacionesEmail('SICOES Bolivia', resultados);
    }

    let progreso = {};
    if (await fs.pathExists(progresoPath)) {
      progreso = await fs.readJSON(progresoPath);
    }
    progreso['sicoesScraper'] = new Date().toISOString();
    await fs.writeJSON(progresoPath, progreso, { spaces: 2 });
  } catch (err) {
    console.error('❌ Error en runSicoes:', err.message);
  }
}

module.exports = { runSicoes };
