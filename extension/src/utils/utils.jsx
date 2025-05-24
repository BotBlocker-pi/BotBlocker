export function extractPerfilNameAndPlatformOfURL(url) {
    try {
        const parsedUrl = new URL(url);

        const socialPlatforms = {
            instagram: ['instagram.com'],
            linkedin: ['linkedin.com'],
            x: ['x.com', 'twitter.com']
        };

        let plataform = null;
        for (const [key, domains] of Object.entries(socialPlatforms)) {
            if (domains.some(domain => parsedUrl.hostname.toLowerCase().includes(domain))) {
                plataform = key;
                break;
            }
        }

        const pathSegments = parsedUrl.pathname.replace(/^\/|\/$/g, '').split('/'); // remove slashes and split
        let perfil_name = null;

        if (plataform === 'x' && pathSegments.length > 0) {
            perfil_name = pathSegments[0];
        } else if (plataform === 'linkedin') {
            if (pathSegments.length >= 2 && ['in', 'company', 'school'].includes(pathSegments[0])) {
                perfil_name = pathSegments[1];
            }
        } else if (plataform === 'instagram' && pathSegments.length > 0) {
            perfil_name = pathSegments[0];
        }

        return { perfil_name, plataform };
    } catch (error) {
        console.error("Invalid URL:", error);
        return { perfil_name: null, plataform: null };
    }
}
