/**
 * Gerencia a comunicação com a API externa
 */
import { logInfo, logError } from '../utils/logging';

// Perfis da API
let perfisDaAPI = [];

// Busca os perfis da API via background script
export async function fetchPerfis() {
    return new Promise((resolve, reject) => {
        try {
            logInfo('Requesting profiles from background script...');

            // Send message to background script
            chrome.runtime.sendMessage({action: "fetchProfiles"}, (response) => {
                if (response && response.success) {
                    perfisDaAPI = response.profiles;
                    logInfo(`Profiles loaded successfully: ${perfisDaAPI.length}`);

                    // Log the profiles loaded for debugging
                    if (perfisDaAPI.length > 0) {
                        logInfo('Sample profiles:');
                        perfisDaAPI.slice(0, 3).forEach(profile => {
                            logInfo(`- ${profile.username}: ${profile.percentage}%`);
                        });
                    }

                    resolve(perfisDaAPI);
                } else {
                    logError('Error fetching profiles from background script');
                    perfisDaAPI = []; // Fallback para array vazio
                    resolve([]); // Resolve com array vazio em caso de erro
                }
            });
        } catch (error) {
            logError('Error in fetchPerfis:', error);
            perfisDaAPI = []; // Fallback para array vazio
            reject(error);
        }
    });
}

// Retorna o perfil da API pelo username
export function getProfileFromAPI(username) {
    return perfisDaAPI.find(p => 
        p.username && p.username.toLowerCase() === username.toLowerCase()
    );
}

// Retorna todos os perfis da API
export function getAllProfiles() {
    return perfisDaAPI;
}