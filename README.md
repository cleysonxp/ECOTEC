# 🌱 EcoTec

**EcoTec 1.0: O cidadão paulista na linha de frente do monitoramento ambiental**

Projeto de Trabalho de Conclusão de Curso (TCC) do curso de **Bacharelado em Sistemas de Informação – UNIP**.

---

## 📌 Sobre o Projeto

O **EcoTec** é uma aplicação mobile que permite aos cidadãos registrarem e acompanharem **denúncias ambientais** de forma simples, rápida e geolocalizada.

A proposta é aumentar o engajamento da população no monitoramento ambiental, utilizando tecnologia para facilitar a comunicação entre a sociedade e órgãos responsáveis.

---

## 🎯 Objetivo

Desenvolver uma solução tecnológica que:

* Permita o registro de denúncias ambientais
* Utilize geolocalização automática
* Facilite o envio de evidências (imagem/vídeo)
* Exiba denúncias próximas ao usuário
* Integre com APIs de órgãos responsáveis

---

## 📱 Funcionalidades

* Cadastro e login de usuário
* Registro de denúncias com:

  * Título
  * Descrição
  * Categoria
  * Imagem ou vídeo
  * Localização (GPS)
* Feed de denúncias próximas
* Status da denúncia:

  * Recebida
  * Em análise
  * Resolvida
* Histórico de denúncias do usuário
* Interações (curtir/compartilhar)

---

## 🏗️ Arquitetura do Sistema

```text
📱 App (React Native)
        ↓
🌐 API REST (.NET / C#)
        ↓
🗄️ Banco de Dados (MySQL)
```

### Camadas do Back-end:

* **EcoTec.API** → Endpoints / Controllers
* **EcoTec.Domain** → Regras de negócio
* **EcoTec.Infra** → Acesso a dados (MySQL)

---

## 🛠️ Tecnologias Utilizadas

### 🔹 Mobile

* React Native
* TypeScript

### 🔹 Back-end

* .NET / ASP.NET Core
* C#

### 🔹 Banco de Dados

* MySQL

### 🔹 Outros

* API REST
* JSON
* Geolocalização (GPS)
* Arquitetura MVC
* Sistemas Distribuídos

---

## 🗃️ Modelo de Dados (Resumo)

Principais entidades:

* Usuário
* Endereço
* Denúncia
* Tipo de Denúncia
* Endereço da Denúncia
* Interação (Like)

---

## ☁️ Infraestrutura (Deploy)

O sistema será hospedado em nuvem, incluindo:

* API (ASP.NET Core)
* Banco de Dados MySQL
* Integração com o aplicativo mobile

---

## 🔐 Segurança

* Autenticação de usuários
* Proteção de dados sensíveis
* Adequação à LGPD

---

## 📊 Status do Projeto

🚧 Em desenvolvimento (MVP em construção)

---

## 👨‍💻 Integrantes

* Bianca Camilly Pestana Rua
* Cleyson Aparecido Ribeiro Soares
* Vitor dos Santos Lima
* Wesley Santos de Oliveira

---

## 🎓 Instituição

Universidade Paulista – UNIP
Curso: Sistemas de Informação

---

## 📚 Licença

Este projeto é acadêmico e desenvolvido para fins educacionais.

---

## 💡 Considerações Finais

O EcoTec busca unir tecnologia e participação cidadã para contribuir com o monitoramento ambiental, promovendo maior agilidade, transparência e engajamento social.
# ECOTEC
Projeto de TCC
