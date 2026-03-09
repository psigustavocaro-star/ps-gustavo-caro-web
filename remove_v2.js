const jimp = require('jimp');

async function run() {
    const image = await jimp.read('public/images/logo-uchile.png');

    // Explicitly make sure the image has an alpha channel
    image.rgba(true);

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        const brightness = (r + g + b) / 3;
        const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

        // Very aggressive white removal
        if (brightness > 220 && diff < 30) {
            this.bitmap.data[idx + 3] = 0; // Alpha completely transparent
        } else if (brightness > 180 && diff < 30) {
            // Anti-aliasing fade
            const opacity = Math.round(((255 - brightness) / 75) * 255);
            this.bitmap.data[idx + 3] = opacity;
        }
    });

    image.write('public/images/logo-uchile.png', (err) => {
        if (err) console.error(err);
        else console.log('File successfully written with transparency.');
    });
}
run();
