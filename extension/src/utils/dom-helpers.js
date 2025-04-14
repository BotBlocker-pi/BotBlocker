/**
 * Funções auxiliares para manipulação do DOM
 */

// Adiciona estilos globais para a extensão
export function addGlobalStyles() {
    const styles = `
        .bot-blocker-tweet-indicator, .bot-blocker-post-indicator {
            pointer-events: none;
            text-shadow: 0 0 5px rgba(255, 58, 58, 0.5);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #FF3A3A;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            z-index: 100;
            font-size: 14px;
            font-weight: bold;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Adiciona um indicador "BLOCKED" no elemento
export function addBlockIndicator(element, className = 'bot-blocker-tweet-indicator') {
    // Verifica se já existe um indicador
    const existingIndicator = element.querySelector(`.${className}`);
    if (existingIndicator) return;

    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = className;
    indicatorDiv.textContent = 'BLOCKED';

    // Garante que o container tem position relative
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }

    element.appendChild(indicatorDiv);
}

// Remove indicador de bloqueio
export function removeBlockIndicator(element, className = 'bot-blocker-tweet-indicator') {
    const indicator = element.querySelector(`.${className}`);
    if (indicator) {
        indicator.remove();
    }
}