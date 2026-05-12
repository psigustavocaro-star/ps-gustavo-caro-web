import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { userAgent: '*', allow: '/', disallow: ['/api/', '/admingustavo', '/pago/'] },
        ],
        sitemap: 'https://psgustavocaro.cl/sitemap.xml',
        host: 'https://psgustavocaro.cl',
    };
}
