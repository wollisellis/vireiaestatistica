// Utilities para manipulação de datas - Firebase compatibility
// CORRIGE: TypeError: s.getTime is not a function

/**
 * Converte qualquer formato de data (Date, Timestamp, string, etc.) para Date válido
 * Compatível com Firebase Timestamps e outros formatos
 */
export const parseFirebaseDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  
  try {
    // Se já é um Date válido
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    // Se é um Timestamp do Firebase
    if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    // Se é um objeto com seconds (Timestamp serializado)
    if (dateValue?.seconds && typeof dateValue.seconds === 'number') {
      return new Date(dateValue.seconds * 1000);
    }
    
    // Se é uma string ou número
    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch (error) {
    console.warn('Erro ao parse da data:', error, dateValue);
    return null;
  }
};

/**
 * Verifica se uma atividade foi recente (últimas 24 horas)
 * SAFE: Não lança TypeError
 */
export const isRecentActivity = (lastActivity: any): boolean => {
  const date = parseFirebaseDate(lastActivity);
  if (!date) return false;
  
  const now = Date.now();
  const diff = now - date.getTime();
  return diff < 24 * 60 * 60 * 1000; // 24 horas em ms
};

/**
 * Calcula diferença em horas entre duas datas
 * SAFE: Retorna 0 em caso de erro
 */
export const getHoursDiff = (date1: any, date2: any = new Date()): number => {
  const d1 = parseFirebaseDate(date1);
  const d2 = parseFirebaseDate(date2);
  
  if (!d1 || !d2) return 0;
  
  return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60);
};

/**
 * Formata tempo relativo (ex: "há 2 horas")
 * SAFE: Retorna string padrão em caso de erro
 */
export const getTimeAgo = (lastActivity: any): string => {
  const date = parseFirebaseDate(lastActivity);
  if (!date) return 'Nunca';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (days > 0) return `Há ${days} dia${days === 1 ? '' : 's'}`;
  if (hours > 0) return `Há ${hours} hora${hours === 1 ? '' : 's'}`;
  if (minutes > 0) return `Há ${minutes} minuto${minutes === 1 ? '' : 's'}`;
  return 'Agora há pouco';
};

/**
 * Extrai timestamp seguro para ordenação
 * SAFE: Retorna 0 em caso de erro
 */
export const getTimestamp = (dateValue: any): number => {
  const date = parseFirebaseDate(dateValue);
  return date ? date.getTime() : 0;
};