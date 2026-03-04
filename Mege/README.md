# 📚 Sistema de Agendamento de Provas Orais

## 📝 Descrição

Esta funcionalidade consiste em um sistema que permite aos alunos visualizar e agendar horários para provas orais com base na disponibilidade dos professores. O objetivo é automatizar e organizar o processo de agendamento, facilitando a gestão para a equipe docente e oferecendo mais autonomia e praticidade aos alunos.

-------

## ⚙️ Funcionalidades Principais

### 1. 📅 Disponibilidade dos Professores
- Os professores (ex.: Arnaldo e Fernando) terão agendas com horários pré-definidos.
- Exemplos de horários disponíveis:
  - 08:00
  - 09:00
  - 10:00
- Esses horários ficarão visíveis para os alunos no sistema.

-------

### 2. 👩‍🎓 Seleção pelo Aluno
- O aluno poderá acessar a lista de horários disponíveis diretamente no site.
- Poderá escolher um horário para agendar sua prova oral de forma simples e rápida.

-------

### 3. 🔀 Flexibilidade de Visualização
O sistema poderá operar em dois modos:

- **Modo 1:** O aluno escolhe o horário sabendo qual professor estará disponível.
- **Modo 2:** O professor é escolhido automaticamente pelo sistema, e o aluno seleciona apenas um horário vago.

-------

### 4. 🎥 Integração com Sala de Reunião
- Cada professor terá um link de reunião individual (ex.: Google Meet).
- O link pode ser:
  - Fixo por professor, ou
  - Gerado automaticamente para cada sessão.

Quando o aluno agendar a prova:
- Receberá automaticamente o link correspondente ao professor escolhido ou designado.

-------

## ✅ Benefícios

- ✔ Organização automatizada do agendamento  
- ✔ Redução de conflitos de horário  
- ✔ Maior autonomia para os alunos  
- ✔ Simplificação na gestão de provas orais  
- ✔ Cada professor com sua própria sala virtual  
- ✔ Alunos acessando o ambiente correto no horário marcado  
- ✔ Envio automático e integrado de convites  

-------

## 🚀 Resultado Esperado

A implementação deste sistema tornará o processo de agendamento de provas orais mais eficiente, organizado e acessível, melhorando a experiência tanto para alunos quanto para professores.

-----------------------------------------------------------------------------------

# Implementação da Aba de Ofertas na Área do Aluno

## 📌 Visão Geral

Este documento descreve a implementação de uma funcionalidade já existente em uma versão anterior do site, que se mostrou altamente útil para a conversão de alunos em novas turmas.

Atualmente, a área do aluno não possui uma **"Aba de Ofertas"** na coluna de navegação. A proposta consiste na criação dessa aba para disponibilizar promoções especiais e exclusivas direcionadas aos alunos.

-------

## 🎯 Objetivo da Funcionalidade

Criar uma nova aba na área do aluno que permita:

* Exibir ofertas especiais e exclusivas
* Incentivar alunos atuais a adquirirem novas turmas
* Direcionar campanhas promocionais específicas para a base de alunos
* Aumentar retenção e ticket médio

-------

## 🧩 Contexto

Em versões anteriores do site, essa funcionalidade já existia e demonstrou resultados positivos, sendo considerada estratégica para marketing e vendas.

A ausência dessa aba na versão atual limita a capacidade de oferecer promoções segmentadas diretamente para alunos logados.

-------

## 🛠️ Escopo da Implementação

### 1. Interface

* Criar nova aba chamada **"Ofertas"** na coluna de navegação da área do aluno
* Seguir o padrão visual existente da plataforma
* Exibir lista de ofertas disponíveis com:

  * Nome da turma
  * Descrição resumida
  * Valor promocional
  * Botão de compra/inscrição
  * Prazo da oferta

### 2. Funcionalidades

* Permitir cadastro e gerenciamento de ofertas pelo painel administrativo
* Exibir ofertas exclusivas por perfil/grupo de alunos (opcional, se houver segmentação)
* Controlar validade das ofertas
* Possibilidade de destacar ofertas prioritárias

### 3. Regras de Negócio

* Ofertas visíveis apenas para alunos logados
* Ofertas podem ser segmentadas por curso, turma ou perfil
* Ofertas expiram automaticamente após a data limite
* Ofertas não devem aparecer caso estejam esgotadas ou indisponíveis

-------

## 🔐 Permissões e Segurança

* Apenas administradores podem criar/editar ofertas
* A aba deve respeitar autenticação da área do aluno
* Evitar exposição pública de links promocionais exclusivos

-------

## 📊 Benefícios Esperados

* Aumento na conversão de alunos para novas turmas
* Melhor comunicação de promoções
* Maior retenção de alunos
* Canal direto de marketing dentro da plataforma

-------

## 🧪 Critérios de Aceitação

* A aba "Ofertas" aparece na área do aluno
* Ofertas são exibidas corretamente
* Admin consegue cadastrar/editar/remover ofertas
* Ofertas respeitam validade e segmentação
* Compra a partir da aba funciona corretamente

-------

## 🚀 Possíveis Melhorias Futuras

* Notificações automáticas sobre novas ofertas
* Integração com e-mail marketing
* Personalização por comportamento do aluno
* Sistema de cupons de desconto
* Ranking de ofertas mais populares

-------

## 📝 Observações

Esta funcionalidade é considerada estratégica e deve ser priorizada no roadmap de melhorias da área do aluno.

-------

## 📞 Contato

Para dúvidas ou sugestões sobre a implementação, entrar em contato com a equipe de produto ou desenvolvimento responsável pelo projeto.

