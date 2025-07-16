'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import BrazilianDataService, { POFData, SISVANData, DataSUSData, IBGEData } from '@/services/brazilianDataService';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

// Componente simples para Label
const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label {...props} className={`block text-sm font-medium ${props.className || ''}`}>
    {children}
  </label>
);

// Componente simples para Tabs
const Tabs = ({ children, value, className = '' }: { children: React.ReactNode; value: string; className?: string }) => (
  <div className={`w-full ${className}`}>
    {children}
  </div>
);

const TabsList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex bg-gray-100 p-1 rounded-lg ${className}`}>
    {children}
  </div>
);

const TabsTrigger = ({ children, value, disabled = false }: { children: React.ReactNode; value: string; disabled?: boolean }) => (
  <button
    disabled={disabled}
    className={`flex-1 px-3 py-1 text-sm rounded-md ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'}`}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <div className="mt-4">
    {children}
  </div>
);

// Componente simples para CardTitle
const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold text-lg ${className}`}>
    {children}
  </h3>
);

interface BrazilianDataExerciseProps {
  exerciseId: string;
  moduleId: string;
  onComplete: (score: number) => void;
}

export default function BrazilianDataExercise({ exerciseId, moduleId, onComplete }: BrazilianDataExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [brazilianData, setBrazilianData] = useState<{
    pof: POFData[];
    sisvan: SISVANData[];
    datasus: DataSUSData[];
    ibge: IBGEData[];
  }>({
    pof: [],
    sisvan: [],
    datasus: [],
    ibge: []
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    // Carregar dados brasileiros
    const loadData = async () => {
      const pofData = BrazilianDataService.getPOFData();
      const sisvanData = BrazilianDataService.getSISVANData();
      const datasusData = BrazilianDataService.getDataSUSData();
      const ibgeData = BrazilianDataService.getIBGEData();

      setBrazilianData({
        pof: pofData,
        sisvan: sisvanData,
        datasus: datasusData,
        ibge: ibgeData
      });
    };

    loadData();
  }, []);

  const renderPOFExercise = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">📊 Análise de Dados POF 2024</h3>
        <p className="text-sm text-gray-600 mb-4">
          Baseado nos dados da Pesquisa de Orçamentos Familiares (POF) 2024 do IBGE
        </p>
        <Badge variant="outline" className="mb-2">Dados Reais Brasileiros</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribuição Regional do IMC</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={brazilianData.pof.map(item => ({
                region: item.region,
                bmi: item.bmi,
                gender: item.gender
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bmi" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estatísticas Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const stats = BrazilianDataService.getPOFStatistics();
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">IMC Médio:</span>
                      <span className="font-semibold">{stats.averageBMI} kg/m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Renda Média:</span>
                      <span className="font-semibold">R$ {stats.averageIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sobrepeso:</span>
                      <span className="font-semibold">{stats.overweightPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Obesidade:</span>
                      <span className="font-semibold">{stats.obesityPercentage}%</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questão 1: Análise de Dados POF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Com base nos dados da POF 2024 apresentados, qual é a prevalência de sobrepeso na população analisada?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['15,2%', '22,8%', '33,3%', '41,1%'].map((option, index) => (
                <Button
                  key={index}
                  variant={answers.pof_question === option ? "primary" : "outline"}
                  onClick={() => setAnswers({...answers, pof_question: option})}
                  className="text-sm"
                >
                  {option}
                </Button>
              ))}
            </div>
            {answers.pof_question && (
              <Alert>
                <AlertDescription>
                  {answers.pof_question === '33,3%' ? (
                    <span className="text-green-600">✓ Correto! Baseado nos dados POF 2024, a prevalência de sobrepeso está em linha com os padrões epidemiológicos brasileiros.</span>
                  ) : (
                    <span className="text-red-600">✗ Incorreto. Revise os dados apresentados acima.</span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSISVANExercise = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">🏥 Análise de Dados SISVAN</h3>
        <p className="text-sm text-gray-600 mb-4">
          Sistema de Vigilância Alimentar e Nutricional - Dados nacionais
        </p>
        <Badge variant="outline" className="mb-2">Dados do SUS</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribuição do Estado Nutricional</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(BrazilianDataService.getSISVANStatistics().nutritionalStatusDistribution).map(([status, count]) => ({
                    name: status,
                    value: count
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {Object.entries(BrazilianDataService.getSISVANStatistics().nutritionalStatusDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estatísticas SISVAN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const stats = BrazilianDataService.getSISVANStatistics();
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm">Total de Registros:</span>
                      <span className="font-semibold">{stats.totalRecords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">IMC Médio:</span>
                      <span className="font-semibold">{stats.averageBMI} kg/m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Idade Média:</span>
                      <span className="font-semibold">{stats.averageAge} anos</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questão 2: Interpretação SISVAN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Baseado nos dados SISVAN apresentados, qual é o estado nutricional mais prevalente?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['Desnutrição', 'Eutrofia', 'Sobrepeso', 'Obesidade'].map((option, index) => (
                <Button
                  key={index}
                  variant={answers.sisvan_question === option ? "primary" : "outline"}
                  onClick={() => setAnswers({...answers, sisvan_question: option})}
                  className="text-sm"
                >
                  {option}
                </Button>
              ))}
            </div>
            {answers.sisvan_question && (
              <Alert>
                <AlertDescription>
                  <span className="text-green-600">✓ Resposta registrada! Continue para ver o resultado final.</span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataSUSExercise = () => (
    <div className="space-y-6">
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">🏥 Análise de Dados DataSUS</h3>
        <p className="text-sm text-gray-600 mb-4">
          Dados epidemiológicos de doenças crônicas e deficiências nutricionais
        </p>
        <Badge variant="outline" className="mb-2">Dados Epidemiológicos</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Doenças Crônicas (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={Object.entries(BrazilianDataService.getDataSUSStatistics().chronicDiseasePrevalence).map(([disease, prevalence]) => ({
                disease,
                prevalence
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="disease" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="prevalence" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Deficiências Nutricionais (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={Object.entries(BrazilianDataService.getDataSUSStatistics().nutritionalDeficiencyPrevalence).map(([deficiency, prevalence]) => ({
                deficiency,
                prevalence
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="deficiency" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="prevalence" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questão 3: Análise DataSUS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Com base nos dados DataSUS, qual deficiência nutricional tem maior prevalência?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['Ferro', 'Vitamina A', 'Vitamina D', 'Proteína'].map((option, index) => (
                <Button
                  key={index}
                  variant={answers.datasus_question === option ? "primary" : "outline"}
                  onClick={() => setAnswers({...answers, datasus_question: option})}
                  className="text-sm"
                >
                  {option}
                </Button>
              ))}
            </div>
            {answers.datasus_question && (
              <Alert>
                <AlertDescription>
                  <span className="text-green-600">✓ Resposta registrada! Continue para finalizar.</span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResults = () => {
    const correctAnswers = {
      pof_question: '33,3%',
      sisvan_question: 'Eutrofia',
      datasus_question: 'Vitamina D'
    };

    const correctCount = Object.entries(answers).filter(([key, value]) => 
      correctAnswers[key as keyof typeof correctAnswers] === value
    ).length;

    const finalScore = (correctCount / Object.keys(correctAnswers).length) * 100;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Resultados</h3>
          <div className="text-4xl font-bold text-blue-600 mb-2">{Math.round(finalScore)}%</div>
          <p className="text-gray-600 mb-4">
            Você acertou {correctCount} de {Object.keys(correctAnswers).length} questões
          </p>
          <Progress value={finalScore} className="w-full max-w-md mx-auto mb-4" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Análise do Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">POF 2024</div>
                  <div className="text-sm text-gray-600">Dados Populacionais</div>
                  <div className="text-lg">
                    {answers.pof_question === correctAnswers.pof_question ? '✓' : '✗'}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">SISVAN</div>
                  <div className="text-sm text-gray-600">Vigilância Nutricional</div>
                  <div className="text-lg">
                    {answers.sisvan_question === correctAnswers.sisvan_question ? '✓' : '✗'}
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">DataSUS</div>
                  <div className="text-sm text-gray-600">Dados Epidemiológicos</div>
                  <div className="text-lg">
                    {answers.datasus_question === correctAnswers.datasus_question ? '✓' : '✗'}
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Feedback:</strong> {
                    finalScore >= 80 ? 
                      'Excelente! Você demonstrou boa compreensão dos dados brasileiros de saúde e nutrição.' :
                    finalScore >= 60 ? 
                      'Bom trabalho! Revise os conceitos sobre interpretação de dados epidemiológicos brasileiros.' :
                      'Continue estudando! É importante dominar a interpretação de dados nacionais para a prática profissional.'
                  }
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button onClick={() => {
            setShowResults(false);
            setCurrentStep(0);
            setAnswers({});
          }} variant="outline">
            Refazer Exercício
          </Button>
          <Button onClick={() => onComplete(finalScore)}>
            Finalizar
          </Button>
        </div>
      </div>
    );
  };

  const steps = [
    { title: 'POF 2024', content: renderPOFExercise },
    { title: 'SISVAN', content: renderSISVANExercise },
    { title: 'DataSUS', content: renderDataSUSExercise },
    { title: 'Resultados', content: renderResults }
  ];

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {renderResults()}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Exercício com Dados Brasileiros</h2>
          <Badge variant="outline">
            Passo {currentStep + 1} de {steps.length}
          </Badge>
        </div>
        <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full" />
      </div>

      <div className="mb-6">
        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {steps.map((step, index) => (
              <TabsTrigger key={index} value={index.toString()} disabled={index > currentStep}>
                {step.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={currentStep.toString()}>
            {steps[currentStep].content()}
          </TabsContent>
        </Tabs>
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
              setShowResults(true);
            } else {
              setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
            }
          }}
          disabled={currentStep < steps.length - 1 && !answers[`${['pof', 'sisvan', 'datasus'][currentStep]}_question`]}
        >
          {currentStep === steps.length - 1 ? 'Ver Resultados' : 'Próximo'}
        </Button>
      </div>
    </div>
  );
}