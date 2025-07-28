'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { 
  X, 
  AlertTriangle, 
  Mail, 
  Lock,
  BookOpen,
  GraduationCap,
  Loader2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  classInfo?: {
    name: string;
    professorName: string;
    semester?: string;
    year?: string;
  };
  showCreateAccount?: boolean;
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  classInfo,
  showCreateAccount = true 
}: AuthModalProps) {
  const { signInWithGoogle, signUp, signIn } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const { error } = await signInWithGoogle('student');
      
      if (error) {
        throw new Error(error);
      }
      
      // Success
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login com Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      if (!email || !password) {
        throw new Error('Preencha todos os campos');
      }

      const { error } = await signIn(email, password);
      
      if (error) {
        throw new Error(error);
      }
      
      // Success
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Validations
      if (!fullName || !email || !password || !confirmPassword) {
        throw new Error('Preencha todos os campos');
      }

      if (!email.endsWith('@dac.unicamp.br')) {
        throw new Error('Use seu email institucional @dac.unicamp.br');
      }

      if (password !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      const { error } = await signUp(
        email,
        password,
        fullName,
        'student',
        'NT600' // Default course code
      );
      
      if (error) {
        throw new Error(error);
      }
      
      // Success
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <DialogTitle className="text-xl">
                      Login Necessário
                    </DialogTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <DialogDescription className="mt-2">
                  {classInfo ? (
                    <span>
                      Faça login para entrar na turma <strong>{classInfo.name}</strong>
                    </span>
                  ) : (
                    'Faça login para continuar'
                  )}
                </DialogDescription>
              </DialogHeader>

              {/* Class Info */}
              {classInfo && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">{classInfo.name}</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Professor: {classInfo.professorName}
                      </p>
                      {classInfo.semester && classInfo.year && (
                        <p className="text-sm text-blue-600 mt-1">
                          {classInfo.semester} {classInfo.year}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </motion.div>
              )}

              {!showCreateForm ? (
                <>
                  {/* Login Options */}
                  <div className="space-y-4">
                    {/* Google Sign In - Primary */}
                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-gray-400 font-medium"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Entrar com Google
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou</span>
                      </div>
                    </div>

                    {/* Email Login Form */}
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>Email</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu.email@dac.unicamp.br"
                          className="mt-1"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="flex items-center space-x-1">
                          <Lock className="w-4 h-4" />
                          <span>Senha</span>
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Digite sua senha"
                          className="mt-1"
                          disabled={loading}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Entrar'
                        )}
                      </Button>
                    </form>

                    {showCreateAccount && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          disabled={loading}
                        >
                          Não tem conta? Criar agora
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Create Account Form */}
                  <form onSubmit={handleCreateAccount} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Nome Completo *</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="newEmail">Email Institucional *</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.nome@dac.unicamp.br"
                        className="mt-1"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use seu email @dac.unicamp.br
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="newPassword">Senha *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Digite a senha novamente"
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        disabled={loading}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Criar Conta'
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}

              <DialogFooter className="mt-6 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center w-full">
                  Ao fazer login, você concorda com nossos termos de uso e política de privacidade.
                </p>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;