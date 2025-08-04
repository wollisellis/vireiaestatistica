**#Introdução - Bioestatística**

Disciplina com 2 atividades avaliativas: Prova (5/10) e Exercício com o JASP (5/10) = 10/10

---

## 1. Conceitos Fundamentais

- **População x Amostra**
    - População: conjunto total de interesse.
    - Amostra: parte da população analisada.
    - *Nota*: Uma amostra representativa reflete bem as características da população, permitindo generalizações mais seguras.
    - Validade da amostra:
        - Externa: se os resultados podem ser generalizados para a população.
        - Interna: se o estudo foi conduzido de forma correta, sem vieses.

- **Parâmetros x Estimativas**
    - Parâmetro: valor real na população (ex: média real de altura).
    - Estimativa: valor calculado na amostra.
    - *Exemplo*: Se a média de altura dos alunos de uma turma (amostra) é 1,70m, essa é uma estimativa da média de altura de todos os alunos da escola (população).

- **Estudo ecológico**
    - Compara populações (ex: taxas de obesidade em diferentes cidades).
    - *Limitação*: Não permite afirmar relações causais entre variáveis, pois trabalha com médias populacionais.

---

## 2. Coleta de Dados

- O que é? Processo de obter informações para análise.
- Elementos: unidades de análise (pessoas, domicílios, creches, células, etc).
- Variáveis: características estudadas (idade, peso, sexo, pressão arterial, etc).
- *Dica*: O planejamento da coleta é fundamental para garantir a qualidade dos dados. Questione sempre: como, onde e quando os dados foram coletados?

---

## 2.1 Tipos de Amostras

- **Amostragem probabilística**: Todos os elementos da população têm chance conhecida e diferente de zero de serem selecionados.
    - Exemplos:
        - Aleatória simples: sorteio puro entre todos os elementos.
        - Sistemática: seleção a cada k elementos de uma lista.
        - Estratificada: divisão da população em grupos (estratos) e sorteio proporcional em cada grupo.
        - Por conglomerados: sorteio de grupos inteiros (ex: escolas, bairros) e análise de todos os elementos desses grupos.

- **Amostragem não probabilística**: Nem todos os elementos têm chance conhecida de serem selecionados; depende de critérios subjetivos ou de conveniência.
    - Exemplos:
        - Conveniência: seleciona quem está mais acessível (ex: voluntários em uma praça).
        - Intencional (ou por julgamento): seleciona quem o pesquisador considera mais representativo.
        - Bola de neve: participantes indicam novos participantes (comum em populações difíceis de acessar).

- *Observação*: Amostras probabilísticas permitem generalizar resultados para a população com maior segurança estatística. Amostras não probabilísticas são úteis em situações exploratórias ou quando não é possível realizar sorteio, mas têm maior risco de viés.

### Fluxograma para escolha do tipo de amostragem

1. É possível listar todos os elementos da população?
    - **Sim** → Siga para 2.
    - **Não** → Use amostragem não probabilística.
2. Todos os elementos têm chance conhecida e igual de serem sorteados?
    - **Sim** → Amostragem probabilística (aleatória simples).
    - **Não** → Siga para 3.
3. A população pode ser dividida em grupos homogêneos (estratos)?
    - **Sim** → Amostragem estratificada.
    - **Não** → Siga para 4.
4. É mais prático sortear grupos inteiros (ex: escolas, bairros)?
    - **Sim** → Amostragem por conglomerados.
    - **Não** → Considere amostragem sistemática ou reavalie a estratégia.

*Resumo*: Sempre que possível, prefira amostras probabilísticas para garantir validade estatística. Use amostras não probabilísticas apenas quando não houver alternativa viável.

---

## 3. Análise Descritiva

- **Análise exploratória**
    - Tabelas e gráficos (ex: histogramas, gráficos de barras)
    - Medidas resumo numéricas:
        - Média e desvio padrão (tendência central e dispersão)
        - Mediana, quartis, percentis (posição dos dados)
        - Moda, extremos (valor mais frequente, mínimo/máximo)
        - Frequências (contagem de ocorrências)
    - *Dica*: Sempre visualize os dados antes de calcular medidas numéricas, pois gráficos podem revelar padrões ou outliers que as médias não mostram.

---

## 4. Inferência Estatística

- Fazer afirmações sobre características de uma população, baseando-se em resultados de uma amostra.
    - Amostragem (seleção de parte da população; quanto mais aleatória, mais confiável)
    - Estimação por ponto (ex: média da amostra)
    - Teste de hipótese (avaliar se um resultado é significativo)
- *Observação*: A inferência depende da aleatoriedade na seleção da amostra. Amostras não aleatórias podem gerar resultados enviesados.

---

## 5. Erro Amostral e Tamanho de Amostra

- **Erro amostral**: diferença entre o valor estimado na amostra e o valor real da população. Quanto maior a amostra, menor tende a ser o erro amostral.
- **Tamanho de amostra**: deve ser suficiente para garantir resultados confiáveis; depende da variabilidade dos dados e do nível de precisão desejado.
- O erro amostral pode ser reduzido aumentando o tamanho da amostra, mas há um ponto de equilíbrio entre custo e precisão.
- *Exemplo prático*: Em uma pesquisa eleitoral, amostras pequenas podem gerar resultados muito diferentes da realidade. Já amostras maiores tendem a refletir melhor a opinião da população.
- *Citação*: "O cálculo do tamanho da amostra é fundamental em estudos clínicos e experimentais para garantir validade estatística e ética na pesquisa. Amostras pequenas podem comprometer a detecção de efeitos reais, enquanto amostras excessivamente grandes podem desperdiçar recursos e expor participantes desnecessariamente." (Mint, H.A., 2011)

---

## 6. Tipos de Erros em Testes Estatísticos

- **Erro Tipo I (alfa, α)**: Rejeitar a hipótese nula quando ela é verdadeira (falso positivo).
    - O valor de alfa (α) é geralmente fixado em 0,05 (5%) para testes bilaterais, significando 5% de chance de cometer esse erro.
    - Em testes bilaterais, o alfa é dividido entre as duas extremidades da distribuição (2,5% em cada cauda).
- **Erro Tipo II (beta, β)**: Não rejeitar a hipótese nula quando ela é falsa (falso negativo).
    - O valor de beta (β) geralmente é fixado em até 0,20 (20%), indicando até 20% de chance de não detectar um efeito real.
    - O poder do teste é calculado como 1 - β (ex: poder de 80% significa β = 0,20).
- **Resumo**:
    - Alfa (α): probabilidade de falso positivo (rejeitar H0 quando é verdadeira).
    - Beta (β): probabilidade de falso negativo (não rejeitar H0 quando é falsa).
    - Valores típicos: α = 0,05 (bilateral: 0,025 em cada lado), β = 0,20 (poder = 80%).

### Exemplos práticos:
    - **Erro tipo I (alfa)**: Em um teste para uma nova medicação, rejeitar a hipótese nula significa concluir que o remédio funciona. Se, na verdade, ele não funciona, comete-se um erro tipo I (falso positivo).
    - **Erro tipo II (beta)**: No mesmo teste, não rejeitar a hipótese nula significa concluir que o remédio não funciona. Se, na verdade, ele funciona, comete-se um erro tipo II (falso negativo).

### Como escolher os valores de alfa e beta?
    - O valor de alfa (α) é tradicionalmente fixado em 0,05, mas pode ser menor (ex: 0,01) em estudos onde o custo de um falso positivo é alto (ex: novos medicamentos, diagnósticos graves).
    - O valor de beta (β) é geralmente fixado em até 0,20, mas pode ser menor em estudos que exigem alta sensibilidade para detectar efeitos reais.
    - A escolha depende do contexto, dos riscos envolvidos e do equilíbrio entre detectar efeitos reais e evitar conclusões precipitadas.

---