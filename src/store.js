const fs = require('node:fs');
const path = require('node:path');

const dataDirectory = path.join(__dirname, '..', 'data');
const filePath = path.join(dataDirectory, 'polls.json');

function loadPolls() {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    console.error('Anket verileri okunamadı:', error);
    return [];
  }
}

function savePolls(polls) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(polls, null, 2));
  fs.renameSync(temporaryPath, filePath);
}

module.exports = { loadPolls, savePolls };
