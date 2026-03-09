const Jimp = require('jimp');

async function processIcon() {
    try {
        const image = await Jimp.read('public/icon.png');

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // Umbral para blanco (mayor a 240)
            if (r > 240 && g > 240 && b > 240) {
                this.bitmap.data[idx + 3] = 0; // Hacer transparente (Alpha = 0)
            }
        });

        // Guardar el icono original en PNG, ahora transparente
        await image.writeAsync('public/icon.png');
        await image.writeAsync('src/app/icon.png');
        await image.clone().resize(180, 180).writeAsync('public/apple-icon.png');

        // Guardar versiones adicionales transparentes
        await image.clone().resize(64, 64).writeAsync('public/favicon.png');
        await image.clone().resize(32, 32).writeAsync('src/app/favicon.ico');
        await image.clone().resize(32, 32).writeAsync('public/favicon.ico');

        console.log('Favicons transparentes generados correctamente!');
    } catch (err) {
        console.error('Error:', err);
    }
}

processIcon();
