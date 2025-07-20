'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Trash2, RotateCcw, Clock, AlertTriangle, Search,
  ArrowLeft, Calendar, Users, BookOpen, Info,
  AlertCircle, CheckCircle, X, Zap
} from 'lucide-react';
import { ClassTrashService, DeletedClass, TrashStats } from '@/services/classTrashService';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { motion } from 'framer-motion';

export default function TrashPage() {
  const router = useRouter();
  const { user } = useFirebaseAuth();
  
  const [deletedClasses, setDeletedClasses] = useState<DeletedClass[]>([]);
  const [stats, setStats] = useState<TrashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [restoring, setRestoring] = useState<string | null>(null);
  const [forceDeleting, setForceDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadTrashData();
    }
  }, [user]);

  const loadTrashData = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) return;

      const [classes, trashStats] = await Promise.all([
        ClassTrashService.getDeletedClasses(user.uid),
        ClassTrashService.getTrashStats(user.uid)
      ]);

      setDeletedClasses(classes);
      setStats(trashStats);
    } catch (error) {
      console.error('Erro ao carregar lixeira:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (classId: string) => {
    try {
      setRestoring(classId);
      
      if (!user?.uid) return;

      await ClassTrashService.restoreClass(classId, user.uid);
      
      // Recarregar dados
      await loadTrashData();
      
      alert('Turma restaurada com sucesso!');
    } catch (error) {
      console.error('Erro ao restaurar turma:', error);
      alert('Erro ao restaurar turma. Tente novamente.');
    } finally {
      setRestoring(null);
    }
  };

  const handleForceDelete = async (classId: string, className: string) => {
    const confirmText = `excluir ${className}`;
    const userInput = prompt(
      `Esta ação é IRREVERSÍVEL!\n\nPara excluir permanentemente a turma "${className}", digite: ${confirmText}`
    );

    if (userInput !== confirmText) {
      alert('Texto de confirmação incorreto. Exclusão cancelada.');
      return;
    }

    try {
      setForceDeleting(classId);
      
      if (!user?.uid) return;

      await ClassTrashService.forceDeleteClass(classId, user.uid);
      
      // Recarregar dados
      await loadTrashData();
      
      alert('Turma excluída permanentemente.');
    } catch (error) {
      console.error('Erro ao excluir turma permanentemente:', error);
      alert('Erro ao excluir turma. Tente novamente.');
    } finally {
      setForceDeleting(null);
    }
  };

  const filteredClasses = deletedClasses.filter(deletedClass =>
    deletedClass.originalData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deletedClass.originalData.semester.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysRemainingColor = (days: number) => {
    if (days <= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando lixeira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/professor')}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Trash2 className="h-8 w-8 mr-3 text-red-600" />
                  Lixeira de Turmas
                </h1>
              </div>
              <p className="text-gray-600">
                Turmas excluídas são mantidas por 20 dias antes da exclusão permanente
              </p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Turmas na Lixeira</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalDeleted}</p>
                  </div>
                  <Trash2 className="h-10 w-10 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expirando em Breve</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.expiringSoon}</p>
                    <p className="text-xs text-gray-500">próximos 3 dias</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tamanho Aproximado</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {Math.round(stats.totalSize / 1024)}KB
                    </p>
                  </div>
                  <Info className="h-10 w-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome da turma ou semestre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={loadTrashData}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Atualizar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de turmas excluídas */}
        <Card>
          <CardHeader>
            <CardTitle>Turmas Excluídas ({filteredClasses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhuma turma encontrada' : 'Lixeira vazia'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Tente ajustar os critérios de busca'
                    : 'Não há turmas excluídas no momento'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((deletedClass) => (
                  <motion.div
                    key={deletedClass.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {deletedClass.originalData.name}
                          </h3>
                          <Badge 
                            className={`${getDaysRemainingColor(deletedClass.daysRemaining)} border`}
                          >
                            {deletedClass.daysRemaining > 0 
                              ? `${deletedClass.daysRemaining} dias restantes`
                              : 'Expirado'
                            }
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{deletedClass.originalData.semester} {deletedClass.originalData.year}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{deletedClass.originalData.studentsCount} estudantes</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Excluída em {deletedClass.deletedAt.toDate().toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>Expira em {deletedClass.expiresAt.toDate().toLocaleDateString()}</span>
                          </div>
                        </div>

                        {deletedClass.reason && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Motivo:</strong> {deletedClass.reason}
                            </p>
                          </div>
                        )}

                        {/* Aviso de expiração próxima */}
                        {deletedClass.daysRemaining <= 3 && deletedClass.daysRemaining > 0 && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <p className="text-sm text-red-700">
                                <strong>Atenção:</strong> Esta turma será excluída permanentemente em {deletedClass.daysRemaining} dia(s)!
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex flex-col space-y-2">
                        <Button
                          onClick={() => handleRestore(deletedClass.id)}
                          disabled={!deletedClass.canRestore || restoring === deletedClass.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          {restoring === deletedClass.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Restaurando...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restaurar
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleForceDelete(deletedClass.id, deletedClass.originalData.name)}
                          disabled={forceDeleting === deletedClass.id}
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {forceDeleting === deletedClass.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                              Excluindo...
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Excluir Permanentemente
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações sobre a lixeira */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Como funciona a lixeira</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Turmas excluídas ficam na lixeira por <strong>20 dias</strong></li>
                  <li>• Durante esse período, você pode restaurar a turma a qualquer momento</li>
                  <li>• Os dados dos estudantes são preservados durante o período na lixeira</li>
                  <li>• Após 20 dias, a turma é excluída permanentemente e não pode ser recuperada</li>
                  <li>• Turmas que expiram em 3 dias ou menos são destacadas em vermelho</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}