const Jimp = require('jimp');

async function processIcon() {
  try {
    const image = await Jimp.read('public/icon.png');
    // Resize for standard favicon
    image.resize(64, 64).write('public/favicon.png');
    // Save as .ico (many browsers accept PNG encoded data inside an .ico named file, though technically hacky, the alternative is just using favicon.png)
    image.resize(32, 32).write('src/app/favicon.ico');
    image.resize(32, 32).write('public/favicon.ico');
    console.log('Favicons generated successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
}

processIcon();
