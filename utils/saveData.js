const fs = require('fs-extra');
const path = require('path');

const saveData = async (source, data) => {
  const filePath = path.join(__dirname, `../data/licitaciones.json`);
  let existing = [];

  if (await fs.pathExists(filePath)) {
    existing = await fs.readJSON(filePath);
  }

  const filtered = existing.filter(item => item.source !== source);
  const updated = [...filtered, ...data.map(d => ({ ...d, source }))];

  await fs.outputJSON(filePath, updated, { spaces: 2 });
};

module.exports = { saveData };
