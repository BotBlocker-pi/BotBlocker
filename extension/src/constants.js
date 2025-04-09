/**
 * Constantes compartilhadas entre módulos
 */

// Plataformas suportadas
export const PLATFORMS = {
    TWITTER: 'x',
    INSTAGRAM: 'instagram'
};

// Configurações padrão
export const DEFAULT_SETTINGS = {
    tolerance: 50,
    badge: 'empty'
};

// Seletores específicos para plataformas
export const SELECTORS = {
    [PLATFORMS.TWITTER]: {
        PROFILE_NAME: '[data-testid="User-Name"]',
        ARTICLE: '[role="article"]',
        LOADING: 'div[role="progressbar"]',
        SHOW_MORE: '[role="button"]'
    },
    [PLATFORMS.INSTAGRAM]: {
        PROFILE_HEADER: 'header section',
        POST: 'article',
        LOADING: 'svg[aria-label="Loading..."], div[role="progressbar"]'
    }
};

// Padrões de URLs para requisições a bloquear
export const BLOCK_PATTERNS = {
    [PLATFORMS.TWITTER]: ['graphql', 'UserTweets', 'UserMedia', 'UserByScreenName'],
    [PLATFORMS.INSTAGRAM]: ['graphql', 'api/v1/feed/user']
};