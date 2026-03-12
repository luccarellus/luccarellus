import streamlit as st
import pandas as pd
from datetime import datetime
import time

# Configuração da página
st.set_page_config(page_title="Pesquisa de Satisfação - Mytia", layout="centered")

# Estilo customizado
with open("style.css", "r", encoding="utf-8") as f:
    st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

st.title("📊 Pesquisa de Satisfação - Mytia")
st.write("Sua opinião é muito importante para nós! Por favor, responda às questões abaixo:")

# --- PERGUNTAS ---
q1 = st.text_input("Qual a sua empresa ?")

q2 = st.radio(
    "Como você avalia o atendimento da equipe Mytia?",
    ["Excelente", "Bom", "Regular", "Ruim", "Péssimo"],
    index=None
)

q3 = st.radio(
    "O tempo de resposta atendeu às suas expectativas?",
    ["Sim", "Não", "Parcialmente"],
    index=None
)

q4 = st.radio(
    "O problema foi resolvido de forma eficaz?",
    ["Sim", "Não", "Parcialmente"],
    index=None
)

q5 = st.radio(
    "Você considera a equipe da Mytia acessível e prestativa?",
    ["Sim", "Não", "Parcialmente"],
    index=None
)

q6 = st.select_slider(
    "De 0 a 10, qual a probabilidade de você recomendar a Mytia?",
    options=list(range(0, 11)),
    value=None
)

if q6 is None:
    st.write("⚠️ Selecione um valor")
else:
    st.write("Você escolheu:", q6)


q7 = st.text_area("O que você gostaria que fosse melhorado no suporte?")

q8 = st.text_area("Você teve algum problema durante o processo? Se sim, qual?")

q9 = st.text_area("Gostaria de deixar algum comentário adicional?")

q10 = st.number_input("Classifique de 1 a 10 nossas Soluções em IA:", min_value=1, max_value=10,)

q11 = st.text_area("Descreva sua opinião sobre nossa marca e produtos:")

q12 = st.text_area("Qual é sua maior preocupação sobre nosso produto?")

q13 = st.radio(
    "Como prefere receber comunicações da empresa?",
    ["📧 Email", "📱 WhatsApp", "📞 Telefone"],
    index=None
)

q14 = st.text_area("Que funcionalidade gostaria de ver implementada?")
import streamlit as st

# CSS para deixar o input com fundo escuro mesmo quando selecionado
st.markdown("""
    <style>
    textarea, input[type="text"], input[type="password"], input[type="number"] {
        background-color: #181717 !important;
        color: #ffffff !important;
        border: 1px solid #6dbbb5 !important;
    }
    textarea:focus, input[type="text"]:focus, input[type="password"]:focus, input[type="number"]:focus {
        background-color: #222222 !important; /* cor mais clara ao focar */
        color: #ffffff !important;
        border: 1px solid #6dbbb5 !important;
        box-shadow: 0 0 5px #6dbbb5 !important;
    }
    </style>
""", unsafe_allow_html=True)



# --- BOTÃO DE ENVIO ---
if st.button("🚀 Enviar Respostas"):

    # Verifica se todas obrigatórias foram respondidas
    obrigatorias = {
        "Q1": q1, "Q2": q2, "Q3": q3, "Q4": q4, "Q12": q12
    }

    faltando = [pergunta for pergunta, resposta in obrigatorias.items() if resposta is None]

    if faltando:
        st.error("⚠️ Você precisa responder todas as perguntas obrigatórias antes de enviar.")
    else:
        resposta = {
    "Data/Hora": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "Empresa": q1,
    "Avaliação Atendimento": q2,
    "Tempo de Resposta": q3,
    "Problema Resolvido": q4,
    "Equipe Prestativa": q5,
    "Recomendaria (0-10)": q6,
    "Melhorias no Suporte": q7,
    "Problemas Durante Processo": q8,
    "Comentário Adicional": q9,
    "Nota Soluções IA (1-10)": q10,
    "Opinião sobre Marca e Produtos": q11,
    "Maior Preocupação": q12,
    "Canal de Comunicação Preferido": q13,
    "Funcionalidade Desejada": q14
}

                # Salva em CSV (acumulando respostas)
        from pandas.errors import EmptyDataError

        try:
            df = pd.read_csv("respostas.csv")
            df = pd.concat([df, pd.DataFrame([resposta])], ignore_index=True)
        except (FileNotFoundError, EmptyDataError):
            df = pd.DataFrame([resposta])

        df.to_csv("respostas.csv", index=False, encoding="utf-8-sig")


        # Apenas mensagem de sucesso
        placeholder = st.empty()
        placeholder.success("🎉 Obrigado por sua participação! Sua opinião foi registrada com sucesso.")
        st.balloons()

        # Apagar mensagens respondidas após 5 segundos 
        time.sleep(5)
        placeholder.empty(5)