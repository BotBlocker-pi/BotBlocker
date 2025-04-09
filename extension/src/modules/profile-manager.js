/**
 * Gerencia perfis, detecta quais devem ser bloqueados
 */
import { getSettingsAndBlacklist } from '../utils/storage';
import { getProfileFromAPI, getAllProfiles } from './api-client';
import { logHighlight, logComparison } from '../utils/logging';
import { PLATFORMS } from '../constants';

// Conjunto de perfis já encontrados
export const collectedMentions = new Set();

// Conjunto de perfis já bloqueados para evitar repetição
export const perfisBlockeados = new Set();

// Verifica se um perfil deve ser bloqueado
export async function shouldBlockProfile(username, platform) {
    const { settings, blackList } = await getSettingsAndBlacklist();
    const tolerance = settings.tolerance || 50;
    const badgeConfig = settings.badge || 'empty';
    
    // Verificar lista de bloqueio manual
    const isManuallyBlocked = blackList.some(([blockedUsername, blockedPlatform]) => 
        blockedUsername.toLowerCase() === username.toLowerCase() && 
        blockedPlatform.toLowerCase() === platform.toLowerCase()
    );
    
    if (isManuallyBlocked) {
        return { blocked: true, reason: 'manual' };
    }
    
    // Verificar pontuação da API
    const profileData = getProfileFromAPI(username);
    if (profileData) {
        // Verificação da badge conforme configuração
        const profileBadge = profileData.badge || 'empty';
        console.log(`Profile badge: ${profileBadge}`);
        
        // Verificar regras de bloqueio baseadas na badge
        let shouldBlockByBadge = false;
        
        if (badgeConfig === 'bot' && profileBadge === 'bot') {
            shouldBlockByBadge = true;
        } else if (badgeConfig === 'without_verification' && profileBadge === 'empty') {
            shouldBlockByBadge = true;
        } else if (badgeConfig === 'bot_and_without_verification' && 
                  (profileBadge === 'empty' || profileBadge === 'bot')) {
            shouldBlockByBadge = true;
        }
        
        if (shouldBlockByBadge) {
            return {
                blocked: true,
                reason: 'badge',
                badge: profileBadge
            };
        }
        
        // Verificação por porcentagem (mantém a lógica existente)
        if (profileData.percentage > tolerance) {
            return { 
                blocked: true, 
                reason: 'automatic', 
                percentage: profileData.percentage 
            };
        }
    }
    
    return { blocked: false };
}

// Adiciona um perfil à coleção de menções
export function addProfileToCollection(username) {
    const isNew = !collectedMentions.has(username);
    collectedMentions.add(username);
    return isNew;
}

// Registra um perfil como bloqueado
export function markProfileAsBlocked(username) {
    perfisBlockeados.add(username);
}

// Verifica se um perfil já está bloqueado
export function isProfileAlreadyBlocked(username) {
    return perfisBlockeados.has(username);
}

// Gera logs de comparação entre perfis no DOM e na API
export async function generateComparisonLogs(platform) {
    const { settings, blackList } = await getSettingsAndBlacklist();
    const tolerance = settings.tolerance || 50;
    
    // Create a Set for quick lookup of blacklisted profiles
    const manuallyBlockedSet = new Set(
        blackList.map(([username, blockedPlatform]) => 
            `${username.toLowerCase()}|${blockedPlatform.toLowerCase()}`
        )
    );
    
    // Arrays para categorias de perfis
    const profilesBlockedAutomatically = [];
    const profilesBlockedManually = [];
    const profilesNotBlocked = [];
    const profilesOnlyInDOM = [];
    const profilesOnlyInAPI = [];
    
    // Verificar perfis encontrados no DOM
    collectedMentions.forEach(profileName => {
        const apiProfile = getProfileFromAPI(profileName);
        const isManuallyBlocked = manuallyBlockedSet.has(
            `${profileName.toLowerCase()}|${platform.toLowerCase()}`
        );
        
        if (apiProfile) {
            if (isManuallyBlocked) {
                profilesBlockedManually.push({
                    username: profileName,
                    percentage: apiProfile.percentage
                });
            } else if (apiProfile.percentage > tolerance) {
                profilesBlockedAutomatically.push({
                    username: profileName,
                    percentage: apiProfile.percentage
                });
            } else {
                profilesNotBlocked.push({
                    username: profileName,
                    percentage: apiProfile.percentage
                });
            }
        } else {
            if (isManuallyBlocked) {
                profilesBlockedManually.push({
                    username: profileName,
                    percentage: null
                });
            } else {
                profilesOnlyInDOM.push(profileName);
            }
        }
    });
    
    // Encontrar perfis que estão apenas na API
    getAllProfiles().forEach(apiProfile => {
        const foundInDOM = Array.from(collectedMentions).some(
            p => p.toLowerCase() === apiProfile.username.toLowerCase()
        );
        
        if (!foundInDOM) {
            profilesOnlyInAPI.push({
                username: apiProfile.username,
                percentage: apiProfile.percentage
            });
        }
    });
    
    // Exibir logs de comparação
    logComparison('Comparison of DOM vs. API profiles:');
    
    logHighlight('1. Profiles automatically blocked (percentage > tolerance):');
    profilesBlockedAutomatically.forEach(p => {
        console.log(`%c   - @${p.username} (${p.percentage}%)`, 'color: #FF3A3A; font-weight: bold;');
    });
    
    logHighlight('2. Profiles manually blocked:');
    profilesBlockedManually.forEach(p => {
        console.log(`%c   - @${p.username} ${p.percentage ? `(${p.percentage}%)` : ''}`, 'color: #E74C3C; font-weight: bold;');
    });
    
    logHighlight('3. Profiles not blocked (percentage <= tolerance):');
    profilesNotBlocked.forEach(p => {
        console.log(`%c   - @${p.username} (${p.percentage}%)`, 'color: #3498DB;');
    });
    
    logHighlight('4. Profiles only in DOM (Not in API):');
    profilesOnlyInDOM.forEach(p => {
        console.log(`%c   - @${p}`, 'color: #27AE60;');
    });
    
    logHighlight('5. Profiles only in API (Not in current DOM):');
    profilesOnlyInAPI.forEach(p => {
        const style = p.percentage > tolerance ? 'color: #E67E22;' : 'color: #7F8C8D;';
        console.log(`%c   - @${p.username} (${p.percentage}%)`, style);
    });
}