const Jimp = require('jimp');

async function removeWhiteBackground() {
    try {
        const imagePath = 'public/images/logo-uchile.png';
        const image = await Jimp.read(imagePath);

        // Convert to RGBA
        image.colorType(6); // 6 is Truecolor with alpha

        const width = image.bitmap.width;
        const height = image.bitmap.height;

        // Scan each pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const hex = image.getPixelColor(x, y);
                const rgba = Jimp.intToRGBA(hex);

                const r = rgba.r;
                const g = rgba.g;
                const b = rgba.b;

                const brightness = (r + g + b) / 3;
                const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

                // Solid white background check
                if (brightness > 230 && maxDiff < 20) {
                    // Pure transparent
                    image.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 0), x, y);
                } else if (brightness > 215 && maxDiff < 25) {
                    // Anti-aliased / blending edge pixels
                    const opacity = Math.round(((255 - brightness) / 40) * 255);
                    image.setPixelColor(Jimp.rgbaToInt(r, g, b, opacity), x, y);
                }
            }
        }

        await image.writeAsync('public/images/logo-uchile.png');
        console.log('Background removed successfully and saved!');
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

removeWhiteBackground();
