/**
 * Funções para lidar com chrome.storage
 */

// Função para buscar valores do chrome.storage.local
export async function getStorage(keys) {
    try {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    } catch (error) {
        console.error('Erro ao acessar storage:', error);
        await setDefaultSettings();
        return getStorage(keys);
    }
}

export function setStorage(obj) {
    return new Promise((resolve) => {
        chrome.storage.local.set(obj, resolve);
    });
}

export async function setDefaultSettings() {
    const settings = {
        tolerance: 50,
        badge: "empty",
    };
    const blackList = [];
    await setStorage({ settings, blackList });
}

// Função para recuperar configurações e lista de bloqueio
export async function getSettingsAndBlacklist() {
    try {
        const result = await getStorage(["settings", "blackList"]);

        // Garantir que settings tenha valores padrão
        const defaultSettings = {
            tolerance: 50,
            badge: 'empty'
        };

        return {
            settings: result.settings || defaultSettings,
            blackList: result.blackList || []
        };
    } catch (error) {
        console.error('Erro ao obter configurações:', error);
        return {
            settings: { tolerance: 50, badge: 'empty' },
            blackList: []
        };
    }
}