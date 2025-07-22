/**
 * Utilitário de debounce para otimizar chamadas de função
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Logging condicional para desenvolvimento
 */
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG]', ...args);
  }
};

/**
 * Função para normalizar scores de forma segura
 */
export const safeScore = (rawScore: number): number => {
  if (!rawScore || rawScore <= 0) return 0;
  
  // Se parece estar em escala 0-10, converter para 0-100
  if (rawScore > 0 && rawScore <= 10) {
    return Math.min(100, Math.max(0, Math.round(rawScore * 10)));
  }
  
  // Já está em escala 0-100, apenas garantir range
  return Math.min(100, Math.max(0, Math.round(rawScore)));
};