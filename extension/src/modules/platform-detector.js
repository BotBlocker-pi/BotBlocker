/**
 * Módulo para detecção da plataforma atual
 */
import { PLATFORMS } from '../constants';
import { logInfo } from '../utils/logging';

// Detecta a plataforma atual baseado na URL
export function detectCurrentPlatform() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        logInfo('Twitter/X detected');
        return PLATFORMS.TWITTER;
    }
    
    if (hostname.includes('instagram.com')) {
        logInfo('Instagram detected');
        return PLATFORMS.INSTAGRAM;
    }
    
    logInfo(`Unsupported platform detected: ${hostname}`);
    return null;
}

// Obtém o nome do perfil atual da URL
export function getCurrentProfile(platform) {
    const pathname = window.location.pathname;
    
    switch (platform) {
        case PLATFORMS.TWITTER:
            return pathname.split("/")[1] || null;
            
        case PLATFORMS.INSTAGRAM:
            if (pathname.startsWith('/') && pathname.length > 1) {
                return pathname.substring(1).split('/')[0];
            }
            return null;
            
        default:
            return null;
    }
}