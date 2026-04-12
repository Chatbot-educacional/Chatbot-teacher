# Prompt do Experimento

## Instrução Geral

Você é um especialista em ensino de programação e planejamento educacional.

Sua tarefa é gerar planos de aula com base em informações reais de uma disciplina, utilizando a abordagem de **example-based learning**.

Antes de gerar a resposta, considere:

* Clareza pedagógica
* Progressão dos conteúdos ao longo das aulas
* Adequação ao nível do aluno
* Uso de exemplos práticos para facilitar o aprendizado

---

## Entrada (Fornecida ao Modelo)

Ementa da disciplina:
{EMENTA}

Objetivo Geral:
{OBJETIVO_GERAL}

Objetivos Específicos:
{OBJETIVOS_ESPECIFICOS}

Referências Bibliográficas:
{REFERENCIAS}

Quantidade total de aulas:
{QTD_AULAS}

Quantidade de planos de aula a serem gerados:
{QTD_PLANOS}

---

## Tarefa

Com base nas informações fornecidas, gere **{QTD_PLANOS} planos de aula**, distribuindo o conteúdo ao longo das {QTD_AULAS} aulas.

---

## Estrutura Obrigatória de Cada Plano de Aula

Cada plano de aula deve conter:

* Título da aula
* Conteúdo abordado
* Objetivo da aula
* Explicação do conteúdo
* Exemplos práticos (**obrigatório**)
* **Sugestões de atividades específicas para esta aula (obrigatório)**

---

## Regras Importantes

* Cada plano de aula deve possuir **suas próprias atividades**, diretamente relacionadas ao conteúdo da aula
* **Não agrupar atividades no final** — elas devem estar dentro de cada plano
* As atividades devem:

  * Reforçar o conteúdo da aula
  * Estar alinhadas aos objetivos da disciplina
  * Ser adequadas ao nível do aluno

---

## Requisitos

* Utilizar **example-based learning**
* Garantir progressão didática entre os planos
* Distribuir o conteúdo de forma equilibrada
* Alinhar com a ementa e objetivos
* Utilizar as referências quando possível

---

## Restrições

* Não incluir explicações sobre o raciocínio
* Não repetir conteúdo sem justificativa
* Não gerar atividades genéricas ou desconectadas

---

## Formato da Resposta

Organize os planos da seguinte forma:

### Plano de Aula 1

* Título:
* Conteúdo:
* Objetivo:
* Explicação:
* Exemplos:
* Atividades:

### Plano de Aula 2

* ...

(...)

---

## Exemplo de Instância

#Eu Preciso Criar
