'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import BrazilianDataService from '@/services/brazilianDataService';
import { MapPin, User, Heart, TrendingUp } from 'lucide-react';

// Componente simples para CardTitle
const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold text-lg ${className}`}>
    {children}
  </h3>
);

// Componente simples para Alert
const Alert = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 border rounded-lg ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

// Componente simples para Input
const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`w-full p-2 border rounded-lg ${props.className || ''}`}
  />
);

// Componente simples para Textarea
const Textarea = ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    {...props}
    className={`w-full p-2 border rounded-lg ${props.className || ''}`}
  />
);

// Componente simples para Label
const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label {...props} className={`block text-sm font-medium ${props.className || ''}`}>
    {children}
  </label>
);

interface BrazilianCaseStudyProps {
  moduleId: string;
  exerciseId: string;
  onComplete: (score: number) => void;
}

export default function BrazilianCaseStudy({ moduleId, exerciseId, onComplete }: BrazilianCaseStudyProps) {
  const [caseData, setCaseData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Gerar caso clínico com dados brasileiros
    const generateCase = () => {
      const generatedCase = BrazilianDataService.generateCaseStudyData(moduleId);
      setCaseData(generatedCase);
    };

    generateCase();
  }, [moduleId]);

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const classifyBMI = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Baixo peso', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-yellow-600' };
    return { category: 'Obesidade', color: 'text-red-600' };
  };

  const renderPatientProfile = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Perfil do Paciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Dados Pessoais</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Idade:</span>
                <span>{caseData?.patient.age} anos</span>
              </div>
              <div className="flex justify-between">
                <span>Sexo:</span>
                <span>{caseData?.patient.gender === 'M' ? 'Masculino' : 'Feminino'}</span>
              </div>
              <div className="flex justify-between">
                <span>Peso:</span>
                <span>{caseData?.patient.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Altura:</span>
                <span>{caseData?.patient.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span>IMC:</span>
                <span className={classifyBMI(caseData?.patient.bmi || 0).color}>
                  {caseData?.patient.bmi?.toFixed(1)} kg/m²
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contexto Socioeconômico</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Região:</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {caseData?.patient.region}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Município:</span>
                <span>{caseData?.patient.municipality}</span>
              </div>
              <div className="flex justify-between">
                <span>Renda:</span>
                <span>R$ {caseData?.patient.income?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Escolaridade:</span>
                <span>{caseData?.patient.education}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPopulationContext = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Contexto Populacional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Dados Regionais - {caseData?.patient.region}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">População:</span>
                <div className="font-semibold">{caseData?.populationContext.regionalData.population?.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Expectativa de Vida:</span>
                <div className="font-semibold">{caseData?.populationContext.regionalData.demographicIndicators?.lifeExpectancy} anos</div>
              </div>
              <div>
                <span className="text-gray-600">Desnutrição Infantil:</span>
                <div className="font-semibold">{caseData?.populationContext.regionalData.nutritionalIndicators?.stunting}%</div>
              </div>
              <div>
                <span className="text-gray-600">Sobrepeso:</span>
                <div className="font-semibold">{caseData?.populationContext.regionalData.nutritionalIndicators?.overweight}%</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Médias Nacionais (POF 2024)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">IMC Médio:</span>
                <div className="font-semibold">{caseData?.populationContext.nationalAverages?.averageBMI} kg/m²</div>
              </div>
              <div>
                <span className="text-gray-600">Renda Média:</span>
                <div className="font-semibold">R$ {caseData?.populationContext.nationalAverages?.averageIncome?.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600">Sobrepeso:</span>
                <div className="font-semibold">{caseData?.populationContext.nationalAverages?.overweightPercentage}%</div>
              </div>
              <div>
                <span className="text-gray-600">Obesidade:</span>
                <div className="font-semibold">{caseData?.populationContext.nationalAverages?.obesityPercentage}%</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuestions = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Questão 1: Classificação do Estado Nutricional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Com base nos dados antropométricos apresentados, como você classificaria o estado nutricional atual do paciente?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['Baixo peso', 'Peso normal', 'Sobrepeso', 'Obesidade'].map((option) => (
                <Button
                  key={option}
                  variant={answers.classification === option ? "primary" : "outline"}
                  onClick={() => setAnswers({...answers, classification: option})}
                  className="text-sm"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questão 2: Comparação com Dados Populacionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Comparando com as médias nacionais da POF 2024, como o IMC deste paciente se posiciona?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['Muito abaixo da média', 'Abaixo da média', 'Próximo à média', 'Acima da média'].map((option) => (
                <Button
                  key={option}
                  variant={answers.comparison === option ? "primary" : "outline"}
                  onClick={() => setAnswers({...answers, comparison: option})}
                  className="text-sm"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questão 3: Plano de Intervenção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="intervention">
              Elabore um plano de intervenção nutricional considerando o contexto socioeconômico do paciente:
            </Label>
            <Textarea
              id="intervention"
              placeholder="Descreva sua proposta de intervenção nutricional..."
              value={answers.intervention || ''}
              onChange={(e) => setAnswers({...answers, intervention: e.target.value})}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResults = () => {
    const correctClassification = classifyBMI(caseData?.patient.bmi || 0).category;
    const classificationCorrect = answers.classification === correctClassification;
    
    const bmiComparison = caseData?.patient.bmi > (caseData?.populationContext.nationalAverages?.averageBMI || 0);
    const correctComparison = bmiComparison ? 'Acima da média' : 'Abaixo da média';
    const comparisonCorrect = answers.comparison === correctComparison;
    
    const interventionComplete = answers.intervention && answers.intervention.length > 50;
    
    const totalQuestions = 3;
    const correctAnswers = [classificationCorrect, comparisonCorrect, interventionComplete].filter(Boolean).length;
    const finalScore = (correctAnswers / totalQuestions) * 100;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Resultados do Caso Clínico</h3>
          <div className="text-4xl font-bold text-blue-600 mb-2">{Math.round(finalScore)}%</div>
          <p className="text-gray-600 mb-4">
            Você acertou {correctAnswers} de {totalQuestions} questões
          </p>
          <Progress value={finalScore} className="w-full max-w-md mx-auto mb-4" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Análise Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`text-center p-4 rounded-lg ${classificationCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="text-2xl font-bold">Classificação</div>
                  <div className="text-sm text-gray-600">Estado Nutricional</div>
                  <div className="text-lg">{classificationCorrect ? '✓' : '✗'}</div>
                  <div className="text-xs mt-2">Correto: {correctClassification}</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${comparisonCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="text-2xl font-bold">Comparação</div>
                  <div className="text-sm text-gray-600">Dados Populacionais</div>
                  <div className="text-lg">{comparisonCorrect ? '✓' : '✗'}</div>
                  <div className="text-xs mt-2">Correto: {correctComparison}</div>
                </div>
                <div className={`text-center p-4 rounded-lg ${interventionComplete ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="text-2xl font-bold">Intervenção</div>
                  <div className="text-sm text-gray-600">Plano Nutricional</div>
                  <div className="text-lg">{interventionComplete ? '✓' : '✗'}</div>
                  <div className="text-xs mt-2">{interventionComplete ? 'Completo' : 'Incompleto'}</div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Feedback:</strong> {
                    finalScore >= 80 ? 
                      'Excelente! Você demonstrou boa capacidade de análise clínica com dados populacionais brasileiros.' :
                    finalScore >= 60 ? 
                      'Bom trabalho! Continue praticando a integração de dados clínicos com epidemiológicos.' :
                      'Continue estudando! A integração de dados clínicos e populacionais é fundamental para o diagnóstico nutricional.'
                  }
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button onClick={() => {
            setCurrentStep(0);
            setAnswers({});
            setShowFeedback(false);
          }} variant="outline">
            Refazer Caso
          </Button>
          <Button onClick={() => onComplete(finalScore)}>
            Finalizar
          </Button>
        </div>
      </div>
    );
  };

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Gerando caso clínico com dados brasileiros...</p>
        </div>
      </div>
    );
  }

  if (showFeedback) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {renderResults()}
      </div>
    );
  }

  const steps = [
    { title: 'Perfil do Paciente', content: renderPatientProfile },
    { title: 'Contexto Populacional', content: renderPopulationContext },
    { title: 'Questões', content: renderQuestions }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Caso Clínico com Dados Brasileiros</h2>
          <Badge variant="outline">
            Passo {currentStep + 1} de {steps.length}
          </Badge>
        </div>
        <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full" />
      </div>

      <div className="mb-6">
        {steps[currentStep].content()}
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          variant="outline"
        >
          Anterior
        </Button>
        <Button 
          onClick={() => {
            if (currentStep === steps.length - 1) {
              setShowFeedback(true);
            } else {
              setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
            }
          }}
          disabled={currentStep === steps.length - 1 && (!answers.classification || !answers.comparison)}
        >
          {currentStep === steps.length - 1 ? 'Ver Resultados' : 'Próximo'}
        </Button>
      </div>
    </div>
  );
}