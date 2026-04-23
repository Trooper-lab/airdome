const fs = require('fs');
const files = ['en.json', 'nl.json', 'de.json'];
const extra = {
  en: {
    'airshape.product.airgate.name': 'Airgate',
    'airshape.product.airgate.desc': 'The iconic inflatable archway for every finish line.'
  },
  nl: {
    'airshape.product.airgate.name': 'Airgate',
    'airshape.product.airgate.desc': 'De iconische opblaasbare boog voor elke finishlijn.'
  },
  de: {
    'airshape.product.airgate.name': 'Airgate',
    'airshape.product.airgate.desc': 'Der ikonische aufblasbare Bogen für jede Ziellinie.'
  }
};

files.forEach(file => {
  const lang = file.split('.')[0];
  const path = `src/i18n/locales/${file}`;
  if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    Object.assign(data, extra[lang]);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
});
