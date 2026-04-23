const fs = require('fs');
const files = ['en.json', 'nl.json', 'de.json'];
const extra = {
  en: {
    'airgate.hero.cta': 'Design my Airgate →'
  },
  nl: {
    'airgate.hero.cta': 'Ontwerp mijn Airgate →'
  },
  de: {
    'airgate.hero.cta': 'Meinen Airgate entwerfen →'
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
