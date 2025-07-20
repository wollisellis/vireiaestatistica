// Mock de dados para testar o sistema de ranking
// Simula estudantes com pontuações diferentes no módulo 1

import { db } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { UnifiedScore } from '@/services/unifiedScoringService'

export interface MockStudent {
  id: string
  fullName: string
  anonymousId: string
  moduleScores: Record<string, number>
  totalScore: number
  lastActivity: Date
}

// Dados mock de estudantes brasileiros
export const mockStudents: MockStudent[] = [
  {
    id: 'student-001',
    fullName: 'Ana Silva Santos',
    anonymousId: 'ANT001',
    moduleScores: { 'module-1': 95 },
    totalScore: 95,
    lastActivity: new Date(Date.now() - 1000 * 60 * 30) // 30 min atrás
  },
  {
    id: 'student-002',
    fullName: 'Bruno Oliveira Costa',
    anonymousId: 'ANT002',
    moduleScores: { 'module-1': 87 },
    totalScore: 87,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2h atrás
  },
  {
    id: 'student-003',
    fullName: 'Carla Mendes Lima',
    anonymousId: 'ANT003',
    moduleScores: { 'module-1': 92 },
    totalScore: 92,
    lastActivity: new Date(Date.now() - 1000 * 60 * 15) // 15 min atrás
  },
  {
    id: 'student-004',
    fullName: 'Diego Fernandes Alves',
    anonymousId: 'ANT004',
    moduleScores: { 'module-1': 78 },
    totalScore: 78,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5h atrás
  },
  {
    id: 'student-005',
    fullName: 'Eduarda Rocha Pereira',
    anonymousId: 'ANT005',
    moduleScores: { 'module-1': 84 },
    totalScore: 84,
    lastActivity: new Date(Date.now() - 1000 * 60 * 45) // 45 min atrás
  },
  {
    id: 'student-006',
    fullName: 'Felipe Carvalho Souza',
    anonymousId: 'ANT006',
    moduleScores: { 'module-1': 91 },
    totalScore: 91,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60) // 1h atrás
  },
  {
    id: 'student-007',
    fullName: 'Gabriela Martins Barbosa',
    anonymousId: 'ANT007',
    moduleScores: { 'module-1': 76 },
    totalScore: 76,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3h atrás
  },
  {
    id: 'student-008',
    fullName: 'Henrique Andrade Reis',
    anonymousId: 'ANT008',
    moduleScores: { 'module-1': 89 },
    totalScore: 89,
    lastActivity: new Date(Date.now() - 1000 * 60 * 20) // 20 min atrás
  },
  {
    id: 'student-009',
    fullName: 'Isabela Gomes Ferreira',
    anonymousId: 'ANT009',
    moduleScores: { 'module-1': 83 },
    totalScore: 83,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4h atrás
  },
  {
    id: 'student-010',
    fullName: 'João Pedro Silva Azevedo',
    anonymousId: 'ANT010',
    moduleScores: { 'module-1': 88 },
    totalScore: 88,
    lastActivity: new Date(Date.now() - 1000 * 60 * 10) // 10 min atrás
  }
];

export class MockRankingService {
  // Criar dados mock no Firebase para demonstração
  static async createMockData(): Promise<boolean> {
    try {
      if (!db) {
        console.warn('Firebase não disponível, usando modo mock local');
        return false;
      }

      console.log('Criando dados mock para o ranking...');

      // Criar documentos de usuários
      for (const student of mockStudents) {
        // Criar usuário
        await setDoc(doc(db, 'users', student.id), {
          fullName: student.fullName,
          anonymousId: student.anonymousId,
          role: 'student',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });

        // Criar pontuação unificada
        const unifiedScore: UnifiedScore = {
          studentId: student.id,
          totalScore: student.totalScore,
          normalizedScore: student.totalScore, // Já normalizada para 0-100
          moduleScores: student.moduleScores,
          gameScores: {},
          achievements: [],
          lastActivity: student.lastActivity,
          streak: Math.floor(Math.random() * 7) + 1, // 1-7 dias
          level: Math.floor(student.totalScore / 20) + 1 // Nível baseado na pontuação
        };

        await setDoc(doc(db, 'unified_scores', student.id), {
          ...unifiedScore,
          lastActivity: serverTimestamp()
        });
      }

      console.log(`${mockStudents.length} estudantes mock criados com sucesso!`);
      return true;
    } catch (error) {
      console.error('Erro ao criar dados mock:', error);
      return false;
    }
  }

  // Limpar dados mock
  static async clearMockData(): Promise<boolean> {
    try {
      if (!db) return false;

      console.log('Limpando dados mock...');

      // Em um ambiente real, você usaria batch deletes
      // Por simplicidade, apenas logamos a ação
      console.log('Dados mock limpos (implementação simplificada)');
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados mock:', error);
      return false;
    }
  }

  // Obter dados mock localmente (fallback quando Firebase não disponível)
  static getMockRankingLocal() {
    return mockStudents
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((student, index) => ({
        studentId: student.id,
        anonymousId: student.anonymousId,
        fullName: student.fullName,
        totalScore: student.totalScore,
        normalizedScore: student.totalScore,
        moduleScores: student.moduleScores,
        position: index + 1,
        lastActivity: student.lastActivity,
        isCurrentUser: false
      }));
  }

  // Adicionar pontuação para um estudante existente
  static async addStudentScore(studentId: string, moduleId: string, score: number): Promise<boolean> {
    try {
      if (!db) return false;

      // Atualizar pontuação unificada
      const currentDoc = await setDoc(doc(db, 'unified_scores', studentId), {
        [`moduleScores.${moduleId}`]: score,
        totalScore: score, // Simplificado - apenas um módulo por enquanto
        normalizedScore: score,
        lastActivity: serverTimestamp()
      }, { merge: true });

      console.log(`Pontuação atualizada para ${studentId}: ${score} pontos`);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar pontuação:', error);
      return false;
    }
  }
}

export default MockRankingService;