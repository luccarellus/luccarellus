# 📊 Sistema de NPS – Mytia Tecnologia

## 📝 Descrição

Esta funcionalidade consiste em um sistema de **coleta e análise de NPS (Net Promoter Score)** para medir o nível de satisfação dos clientes da **Mytia Tecnologia**.

O objetivo é **coletar feedback dos usuários de forma simples e estruturada**, permitindo identificar **pontos de melhoria nos produtos e serviços oferecidos pela empresa**.

---

# 🎯 Objetivo da Funcionalidade

Implementar um sistema que permita:

- Avaliar a **satisfação dos clientes**
- Identificar clientes **promotores, neutros e detratores**
- Coletar **feedbacks que auxiliem na melhoria dos serviços**
- Acompanhar **métricas de satisfação ao longo do tempo**

---

# ⚙️ Funcionalidades Principais

## ⭐ 1. Coleta de Avaliação

Os clientes responderão à seguinte **pergunta padrão de NPS**:

> **"De 0 a 10, o quanto você recomendaria a Mytia Tecnologia para um amigo ou colega?"**

O usuário seleciona **uma nota entre 0 e 10** para registrar sua avaliação.

---

## 📊 2. Classificação das Respostas

As respostas serão **classificadas automaticamente** conforme a metodologia **NPS**:

### 🟢 Promotores (9–10)

Clientes **muito satisfeitos** que recomendam a empresa.

### 🟡 Neutros (7–8)

Clientes **satisfeitos**, porém **sem forte tendência de recomendação**.

### 🔴 Detratores (0–6)

Clientes **insatisfeitos** que podem impactar negativamente a **reputação da empresa**.

---

## 🧮 3. Cálculo do NPS

O sistema calcula automaticamente o **índice NPS** utilizando a fórmula:

```text
NPS = % Promotores - % Detratores
