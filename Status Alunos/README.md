# 📘 Sistema de Status dos Alunos MEGE

Este documento define as **regras visuais e funcionais** para a aba **Status dos Alunos** do sistema MEGE, com foco em clareza, padronização e controle de histórico.

---

## 📌 Objetivo

* Facilitar a visualização do status do aluno
* Padronizar cores e ações
* Garantir registro de histórico e justificativas
* Melhorar a experiência de gerenciamento dos alunos

---

## 🟢 Badges de Status

Cada aluno deve possuir um **badge colorido** indicando seu status atual:

| Cor         | Status                  | Descrição                                        |
| ----------- | ----------------------- | ------------------------------------------------ |
| 🟢 Verde    | **Ativo**               | Aluno com acesso normal aos cursos e ferramentas |
| ⚪ Cinza     | **Inativo**             | Aluno sem acesso, com motivo registrado          |
| 🟡 Amarelo  | **Trancado / Suspenso** | Acesso pausado por solicitação ou pendencia     |
| 🔴 Vermelho | **Cancelado**           | Encerramento definitivo do vínculo               |

---

## 🖥 Melhorias na Interface

### Coluna **Status**

* Exibir badge colorido correspondente
* Cores padrão: verde (ou azul), cinza, amarelo, vermelho
* Toggle alinhado à direita quando possível ativar/inativar rapidamente

---

## 🔁 Lógica de Funcionamento

### Toggle de Status

O toggle deve permitir apenas:

```
Ativo ↔ Inativo
```

Para outros status (**Trancado** ou **Cancelado**), usar fluxo próprio:

* Modal de confirmação
* Tela de edição
* Registro obrigatório no histórico

Isso garante rastreabilidade das alterações.

---

## ⚙️ Coluna **Ação**

Adicionar opção para alterar o status do aluno conforme seu badge.

### Regras obrigatórias

Sempre que o status for alterado:

1. Solicitar **justificativa obrigatória**
2. Registrar no histórico do aluno

### Exemplos

* Pedido de reembolso → Badge **Amarelo**
* Aluno não deseja continuar → Badge **Vermelho**

O histórico de cursos comprados deve ser mantido.

---

## 📚 Regras de Acesso por Status

### 🟡 Inativo / Suspenso / Trancado (Cinza ou Amarelo)

O aluno terá acesso a:

* Histórico de compras
* Ferramentas do sistema
* Certificados (se possuir)

Sem acesso aos cursos comprados.

---

### 🔴 Cancelado

O aluno terá:

* Histórico de compras somente
* Sem acesso aos cursos
* Histórico visível apenas para usuários do App MEGE

---

## 🧭 Mudança de Status

Mudanças podem ser feitas por:

* Aba própria de Status
* Menu de ações do aluno
* Modal de edição

Sempre com justificativa e histórico registrados.

---

## ✅ Benefícios Esperados

* Interface clara e intuitiva
* Controle seguro do status dos alunos
* Histórico completo de alterações
* Melhor organização administrativa

---

## 📌 Padrão Obrigatório para Novos Status

Todo novo status deve possuir:

* Badge visual
* Registro de histórico
* Justificativa (opcional em caso de aluno ativo)
---

## 👨‍💻 Autor

Documento criado para padronização do sistema de status dos alunos MEGE.

---

⭐ Se este documento ajudou, considere manter atualizado conforme novas regras do sistema.
