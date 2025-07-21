/**
 * Utilitários seguros para acesso ao localStorage e sessionStorage
 * Previne erros quando o storage não está disponível (SSR, navegadores antigos, etc)
 */

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Erro ao acessar localStorage para a chave ${key}:`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Erro ao salvar no localStorage para a chave ${key}:`, error);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover do localStorage a chave ${key}:`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null;
    }
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Erro ao acessar sessionStorage para a chave ${key}:`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error(`Erro ao salvar no sessionStorage para a chave ${key}:`, error);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover do sessionStorage a chave ${key}:`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar sessionStorage:', error);
    }
  }
};

/**
 * Remove múltiplas chaves do localStorage de forma segura
 */
export const removeMultipleFromStorage = (keys: string[]): void => {
  keys.forEach(key => safeLocalStorage.removeItem(key));
};

/**
 * Limpa cookies de forma segura
 */
export const clearCookie = (name: string): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

/**
 * Limpa múltiplos cookies
 */
export const clearMultipleCookies = (names: string[]): void => {
  names.forEach(name => clearCookie(name));
};