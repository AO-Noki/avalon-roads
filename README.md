# Avalon Roads

Um explorador interativo de mapas Avalon Roads do Albion Online, construído com Astro, TypeScript e Tailwind CSS.

## Funcionalidades

- 🗺️ Navegue e pesquise mapas Avalon
- 🔍 Filtre por recursos e tiers
- 🌓 Modo claro/escuro com suporte a preferência do sistema
- 🎯 Indicadores de tipo de recurso com tooltips
- ⌨️ Atalhos de teclado para navegação rápida
- 📱 Design totalmente responsivo

## Stack Tecnológica

- [Astro](https://astro.build) - Gerador de Site Estático
- [TypeScript](https://www.typescriptlang.org/) - Segurança de Tipos
- [Tailwind CSS](https://tailwindcss.com) - Estilização
- [Font Awesome](https://fontawesome.com) - Ícones

## Desenvolvimento

### 1. Instale as dependências

```bash
npm install
```

### 2. Extraia os dados dos mapas (se você tiver o arquivo HTML original)

```bash
npm run extract-maps [caminho/para/Avalon Map.html]
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### 4. Compile para produção

```bash
npm run build
```

### 5. Visualize a compilação de produção

```bash
npm run preview
```

## Estrutura do Projeto

```text
/
├── public/
│   └── icons/           # Ícones de recursos do jogo
├── src/
│   ├── components/      # Componentes Astro reutilizáveis
│   ├── data/            # Dados dos mapas em formato JSON
│   ├── layouts/         # Layouts de página
│   ├── pages/           # Componentes de página
│   ├── scripts/         # Scripts utilitários
│   ├── types/           # Definições de tipos TypeScript
│   └── utils/           # Funções utilitárias
└── package.json
```

## Contribuindo

1. Faça um fork do repositório
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adicionar nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Créditos

Desenvolvido por [Brendown Ferreira](https://github.com/Br3n0k)

Parte da organização [AO-Noki](https://github.com/AO-Noki) - Ferramentas para Albion Online

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.
