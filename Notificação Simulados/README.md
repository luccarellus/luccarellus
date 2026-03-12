# 📢 Notificação Automática de Liberação de Simulados

## 📝 Descrição

Atualmente, quando um **simulado é liberado para uma turma**, o sistema não gera uma **notificação automática clara para os alunos**.

Como resultado, alguns alunos podem não perceber imediatamente que um novo simulado está disponível, aumentando a chance de **perderem o prazo para realizá-lo**.

A proposta desta funcionalidade é implementar uma **notificação automática no mural de recados da turma sempre que um simulado for liberado**, garantindo que todos os alunos sejam informados de forma rápida e visível.

---

# 🎯 Objetivo

Melhorar a comunicação dentro da plataforma e garantir que os alunos sejam informados imediatamente sobre novos simulados disponíveis.

A funcionalidade busca:

- Informar automaticamente os alunos quando um simulado for liberado
- Reduzir a chance de perda de prazos
- Centralizar avisos importantes no **mural de recados da turma**
- Tornar a comunicação mais eficiente e transparente

---

# ⚙️ Funcionamento da Funcionalidade

## 📌 Disparo Automático da Notificação

Quando um **administrador ou professor liberar um simulado para uma turma**, o sistema deverá automaticamente:

1. Criar uma nova mensagem no **mural de recados da turma**
2. Informar que um novo simulado está disponível
3. Tornar o aviso visível para todos os alunos daquela turma

---

## 🧾 Conteúdo da Notificação

A mensagem publicada no mural poderá conter informações como:

- Nome do simulado
- Data de liberação
- Prazo para realização (se houver)
- Link ou indicação de onde acessar o simulado

### Exemplo de mensagem

> 📢 **Novo Simulado Disponível**  
> Um novo simulado foi liberado para sua turma.  
> Acesse a área de simulados para realizá-lo dentro do prazo.

---

# 📍 Local da Notificação

A notificação será exibida no:

**Mural de Recados da Turma**

Este mural funciona como um espaço centralizado de comunicação entre a plataforma, professores e alunos.

---

# 👥 Público Impactado

A notificação será visível para:

- Todos os **alunos pertencentes à turma**
- Professores ou administradores com acesso à turma

---

# 📊 Benefícios Esperados

- ✔ Comunicação mais eficiente com os alunos  
- ✔ Redução de alunos que perdem simulados por falta de aviso  
- ✔ Maior engajamento com os simulados  
- ✔ Melhor utilização do mural de recados  
- ✔ Automação de avisos importantes na plataforma  

---

# 🧪 Critérios de Aceitação

A funcionalidade será considerada implementada corretamente quando:

- Ao liberar um simulado para uma turma, uma **mensagem automática** for criada no mural
- A mensagem estiver **visível para todos os alunos da turma**
- O aviso indicar claramente que **um novo simulado foi disponibilizado**
- O aviso aparecer **imediatamente após a liberação do simulado**

---

# 🚀 Possíveis Melhorias Futuras

- Envio adicional de **notificação por e-mail**
- Notificação **push dentro da plataforma**
- Lembretes automáticos antes do **prazo final do simulado**
- Integração com **aplicativo mobile** (se houver)
- Marcação visual de **simulados não realizados**

---

# 📝 Observações

Esta funcionalidade tem como objetivo **aumentar a visibilidade dos simulados liberados**, garantindo que todos os alunos recebam o aviso de forma clara e centralizada dentro da plataforma.
