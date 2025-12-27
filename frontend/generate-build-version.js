/* generate-build-version.js */
import fs from 'fs';

// package.json ko read karte hain
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const appVersion = packageJson.version;

const jsonData = {
  version: appVersion,
  buildDate: new Date().getTime(), // Unique timestamp
};

const jsonContent = JSON.stringify(jsonData, null, 2);

// Public folder mein save karte hain
// Vite mein bhi public folder root pe hi hota hai
if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
}

fs.writeFile('./public/meta.json', jsonContent, 'utf8', function(err) {
  if (err) {
    console.log('❌ Error occured while writing meta.json');
    return console.log(err);
  }
  console.log('✅ meta.json generated with version: ' + appVersion);
});