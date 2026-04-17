# Repositório ECOTEC

## 📁 Estrutura do Projeto

```
ECOTEC/
├── src/
│   ├── screens/          # Telas da aplicação
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── index.ts
│   ├── components/       # Componentes reutilizáveis
│   │   └── LogoPlaceholder.tsx
│   ├── styles/           # Estilos compartilhados
│   │   └── colors.ts     # Paleta de cores
│   └── utils/            # Funções utilitárias
├── assets/               # Imagens, logos e ícones
├── App.tsx               # Componente principal
├── index.ts              # Ponto de entrada
├── package.json
├── tsconfig.json
└── app.json
```

## 🎨 Paleta de Cores

- **Verde Claro Principal**: `#4CAF50`
- **Verde Claro Suave**: `#81C784`
- **Verde Escuro**: `#2E7D32`
- **Branco**: `#FFFFFF`
- **Cinza Claro**: `#F5F5F5`
- **Texto**: `#333333`
- **Erro**: `#F44336`

## 🔒 Tela de Login

### Funcionalidades

- ✅ Campo de Nome de Usuário ou Email
- ✅ Campo de Senha com toggle de visibilidade
- ✅ Botão Entrar
- ✅ Link "Esqueceu a senha?"
- ✅ Link "Cadastre-se"
- ✅ Logo placeholder
- ✅ Design responsivo


## 📝 Tela de Cadastro

### Campos Implementados

**Dados Pessoais:**
- Nome de Usuário
- Email
- Senha (com toggle de visibilidade)
- Confirmar Senha (com toggle de visibilidade)

**Dados de Endereço:**
- CEP
- Estado (UF)
- Cidade
- Bairro
- Rua

### Funcionalidades

- ✅ Validação de campos
- ✅ Scroll automático para campos não visíveis
- ✅ KeyboardAvoidingView otimizado
- ✅ Design consistente com LoginScreen
- ✅ Link para retornar ao login

## 📱 Design Moderno

- Tipografia hierárquica e legível
- Campos com bordas suaves e sombras
- Botões com feedback visual
- Espaçamento adequado entre elementos
- Cores vibrantes e acessíveis
- Ícones intuitivos