// Tipos para os módulos educacionais da plataforma AvaliaNutri

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
  unlockDate?: Date;
  icon?: string;
  estimatedTime: number; // em minutos
  content: ModuleContent[];
  exercises: Exercise[];
  realDataSources?: RealDataSource[];
}

export interface ModuleContent {
  id: string;
  type: 'text' | 'video' | 'image' | 'interactive';
  title: string;
  content: string;
  mediaUrl?: string;
  order: number;
}

export interface Exercise {
  id: string;
  type: 'quiz' | 'matching' | 'drag-drop' | 'calculation' | 'case-study' | 'collaborative' | 'brazilian-data' | 'interactive';
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questions?: Question[];
  caseData?: CaseStudy;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'numeric' | 'text';
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation: string;
  hint?: string;
  hintPenalty?: number; // porcentagem de penalidade
  realDataContext?: string; // contexto de dados reais
}

export interface CaseStudy {
  id: string;
  patientProfile: PatientProfile;
  clinicalHistory: string;
  anthropometricData: AnthropometricData;
  laboratoryData?: LaboratoryData;
  tasks: CaseTask[];
}

export interface PatientProfile {
  age: number;
  gender: 'M' | 'F';
  occupation?: string;
  location?: string;
  socioeconomicLevel?: string;
}

export interface AnthropometricData {
  weight?: number;
  height?: number;
  bmi?: number;
  waistCircumference?: number;
  hipCircumference?: number;
  armCircumference?: number;
  skinfolds?: Record<string, number>;
}

export interface LaboratoryData {
  hemoglobin?: number;
  glucose?: number;
  cholesterolTotal?: number;
  hdl?: number;
  ldl?: number;
  triglycerides?: number;
  albumin?: number;
  [key: string]: number | undefined;
}

export interface CaseTask {
  id: string;
  question: string;
  type: 'diagnosis' | 'calculation' | 'intervention' | 'interpretation';
  requiredFields?: string[];
  points: number;
}

export interface CollaborativeCase {
  id: string;
  moduleId: string;
  exerciseId: string;
  initiatorId: string;
  partnerId?: string;
  caseCode: string;
  startedAt: Date;
  submittedAt?: Date;
  responses: Record<string, any>;
  score?: number;
  feedback?: string;
  discussionTime?: number; // tempo em minutos
}

export interface RealDataSource {
  name: string;
  source: 'POF' | 'SISVAN' | 'DataSUS' | 'IBGE' | 'WHO';
  year: number;
  description: string;
  dataPoints: DataPoint[];
}

export interface DataPoint {
  label: string;
  value: number | string;
  unit?: string;
  region?: string;
  ageGroup?: string;
}

export interface ModuleProgress {
  userId: string;
  moduleId: string;
  completedContent: string[];
  completedExercises: string[];
  totalScore: number;
  lastAccessed: Date;
  timeSpent: number; // em minutos
  isCompleted: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCondition {
  type: 'module_completion' | 'perfect_score' | 'collaboration' | 'streak' | 'data_usage';
  target: number;
  moduleId?: string;
  exerciseType?: string;
}