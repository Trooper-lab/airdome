const fs = require('fs');
const path = require('path');

const srcDir = 'src/components/screens';
const destDir = 'src/components/screens/airgate';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const steps = [
  'Step1_Search.tsx',
  'Step2_Personality.tsx',
  'Step3_Vibe.tsx',
  'Step4_Size.tsx',
  'Step5_Config.tsx',
  'Step6_Event.tsx',
  'Step7_FinalConfig.tsx',
  'Step8_Lead.tsx'
];

steps.forEach(step => {
  const srcPath = path.join(srcDir, step);
  const destPath = path.join(destDir, step);
  
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Replace i18n keys
    content = content.replace(/t\("design\.s/g, 't("airgate.design.s');
    content = content.replace(/t\(`design\.s/g, 't(`airgate.design.s');
    
    // Inject product into Step 8 API payload
    if (step === 'Step8_Lead.tsx') {
      content = content.replace(
        /body: JSON\.stringify\(\{ email, \.\.\.selections, language: locale \}\),/g,
        'body: JSON.stringify({ email, ...selections, language: locale, product: "airgate" }),'
      );
    }
    
    fs.writeFileSync(destPath, content);
    console.log(`Copied and updated ${step} to ${destDir}`);
  }
});
