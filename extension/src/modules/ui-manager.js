/**
 * Gerencia elementos de UI interativos da extensão
 */
import { logInfo } from '../utils/logging';
import { PLATFORMS } from '../constants';

// Monitora mudanças na URL
export function setupUrlChangeMonitor(initializeFunction) {
    let previousUrl = window.location.href;
    
    // Intervalo para verificar mudanças de URL
    const urlCheckInterval = setInterval(() => {
        if (window.location.href !== previousUrl) {
            logInfo(`URL changed from ${previousUrl} to ${window.location.href}`);
            
            // Verificar mudança de plataforma
            const oldHostname = new URL(previousUrl).hostname;
            const newHostname = window.location.hostname;
            
            if (oldHostname !== newHostname) {
                logInfo(`Platform changed from ${oldHostname} to ${newHostname}`);
            }
            
            previousUrl = window.location.href;
            
            // Re-inicializar
            if (typeof initializeFunction === 'function') {
                initializeFunction();
            }
        }
    }, 1000);
    
    return urlCheckInterval;
}

// Mensagens do popup para o content script
export function setupMessageListeners(handlers) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        // Handler para obter perfil atual
        if (request.action === "getCurrentProfile" && handlers.getCurrentProfile) {
            const response = handlers.getCurrentProfile();
            sendResponse(response);
            return true;
        }
        
        // Handler para bloquear perfil manualmente
        if (request.action === "blockProfileManually" && handlers.blockProfileManually) {
            handlers.blockProfileManually(request.username, request.platform);
            sendResponse({ success: true });
            return true;
        }
        
        // Handler para desbloquear perfil manualmente
        if (request.action === "unblockProfileManually" && handlers.unblockProfileManually) {
            handlers.unblockProfileManually(request.username, request.platform);
            sendResponse({ success: true });
            return true;
        }
        
        return true;
    });
}