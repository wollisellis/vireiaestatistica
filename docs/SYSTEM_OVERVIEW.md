# Visão Geral do Sistema - AvaliaNutri

Este documento fornece uma visão geral da arquitetura e dos fluxos de dados da plataforma AvaliaNutri, servindo como um guia para o desenvolvimento e manutenção.

## 1. Atores Principais

- **Professor**: Cria e gerencia turmas, convida alunos, monitora o progresso, configura módulos e analisa os resultados.
- **Estudante**: Entra em turmas, joga os jogos educacionais, acompanha seu próprio progresso e participa do ranking.

## 2. Fluxo de Dados do Professor

1.  **Login**: Professor acessa a plataforma e faz login. O sistema identifica o `role: 'professor'`.
2.  **Dashboard Principal (`/professor`)**:
    - O `EnhancedClassService` é chamado para buscar **todas as turmas ativas** do sistema.
    - A query busca na coleção `classes` e ignora documentos com `status: 'deleted'`.
    - Para cada turma, são calculadas estatísticas básicas (nº de alunos, progresso médio).
3.  **Visualização de Turma (`/professor/turma/[classId]`)**:
    - O `EnhancedClassService` busca os detalhes da turma e a lista de estudantes.
    - **Cálculo de Pontuação**: Para cada estudante, a pontuação total é calculada como a **soma das maiores notas de cada módulo**, obtidas do `unifiedScoringService`.
    - **Exibição do RA**: O UID do Firebase é omitido, e apenas o RA (extraído do e-mail) é exibido.
4.  **Criação de Turma**:
    - Um novo documento é criado na coleção `classes` com um `status` inicial (ex: `'open'`).
    - Um código de convite único é gerado.

## 3. Fluxo de Dados do Estudante

1.  **Login**: Estudante acessa a plataforma. O sistema identifica o `role: 'student'`.
2.  **Entrar na Turma**:
    - O estudante insere um código de convite.
    - O sistema verifica a validade do código na coleção `classInvites`.
    - Um novo documento é criado na coleção `classStudents` para registrar a matrícula, ligando o `studentId` ao `classId`.
3.  **Jogos (`/jogos`)**:
    - O `unifiedScoringService` é usado para registrar o progresso e a pontuação de cada jogo/módulo.
    - Os dados são salvos na coleção `unified_scores` e/ou `student_module_progress`.

## 4. Estrutura de Coleções no Firestore

-   `classes`: Armazena as informações de cada turma (nome, professor, status, etc.).
-   `users`: Contém os perfis dos usuários (professores e estudantes), incluindo nome, e-mail e `role`.
-   `classStudents`: Liga os estudantes às turmas (matrículas). O ID do documento é geralmente `classId_studentId`.
-   `unified_scores`: Armazena a pontuação unificada de cada estudante, com as notas de cada módulo.
-   `student_module_progress`: (Legacy) Pode conter detalhes mais granulares sobre o progresso em cada módulo.

## 5. Lógica de Negócio Crítica

-   **`EnhancedClassService`**: O principal serviço para buscar e processar dados para a visão do professor.
-   **`unifiedScoringService`**: Centraliza toda a lógica de pontuação, garantindo consistência.
-   **Regras do Firestore (`firestore.rules`)**: Essenciais para a segurança, controlando quem pode ler e escrever em cada coleção.

Este documento deve ser atualizado conforme novas funcionalidades são adicionadas. 