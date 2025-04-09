/**
 * Utilitários para logging
 */

export function logInfo(message) {
    console.log(`[BotBlocker] ${message}`);
}

export function logError(message, error) {
    console.error(`[BotBlocker] ${message}`, error);
}

export function logHighlight(title, message, bgColor = '#27AE60', textColor = '#27AE60') {
    console.log(`%c[BotBlocker] ${title}`, `background: ${bgColor}; color: white; padding: 2px 5px; border-radius: 3px;`);
    if (message) {
        console.log(`%c${message}`, `color: ${textColor};`);
    }
}

export function logComparison(title, data) {
    console.log(`%c[BotBlocker] ${title}`, 'background: #8E44AD; color: white; padding: 2px 5px; border-radius: 3px;');
    if (data) {
        console.log(data);
    }
}