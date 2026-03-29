# password.gen

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

Gerador de senhas seguras com interface minimalista e moderna, rodando inteiramente no navegador — sem servidor, sem dependências, sem complicação.

## Como executar

Abra o arquivo `index.html` diretamente no seu navegador.

```
password-generator/
└── index.html   ← abra este arquivo
```

Nenhuma instalação ou servidor necessário.

## Funcionalidades

- Geração de senhas com comprimento configurável (4 a 64 caracteres)
- Seleção de tipos de caracteres:
  - Maiúsculas (A–Z)
  - Minúsculas (a–z)
  - Números (0–9)
  - Símbolos (!@#$...)
- Cópia com um clique para a área de transferência
- Indicador de força da senha (Fraca / Razoável / Boa / Forte)
- Feedback visual para todas as ações
- Responsivo para desktop e mobile

## Segurança

A geração usa [`crypto.getRandomValues`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues), a API criptográfica nativa do navegador. Nenhum dado é enviado a servidores — tudo acontece localmente.

Detalhes da implementação:

- **Rejection sampling** — elimina viés de módulo na escolha de caracteres
- **Fisher-Yates com entropia criptográfica** — embaralha o resultado sem padrões previsíveis
- **Garantia de variedade** — ao menos um caractere de cada tipo selecionado é incluído

## Estrutura do projeto

```
password-generator/
├── index.html   — estrutura e marcação
├── style.css    — estilos (fonte JetBrains Mono, design minimalista)
├── script.js    — lógica de geração e interação
└── README.md    — este arquivo
```

## Tecnologias

- HTML5
- CSS3
- JavaScript (ES2020+, sem frameworks)
- [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) via Google Fonts
- Web Crypto API
