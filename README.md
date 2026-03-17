# Minecraft Map Workspace

Workspace para versionar o render do mapa do mundo Minecraft gerado com `uNmINeD` e publicar o resultado no GitHub Pages.

## Estrutura

- `world/`: save manual do mundo Minecraft MCPE.
- `output/`: site estático gerado pelo `uNmINeD`.
- `mine_mcp/`: recursos auxiliares do MCP usado para registrar pontos e receitas.
- `.github/workflows/deploy-pages.yml`: workflow de publicação do `output/` no GitHub Pages.

## Geração do mapa

Ferramenta base:

```powershell
unmined-cli web render --world ".\world" --dimension overworld --output .\output -c --players --shadows 3do -f
```

## Personalizações persistentes

O `uNmINeD` recria arquivos como `output/index.html` a cada render, então as customizações permanentes devem ficar em arquivos que não são sobrescritos.

Arquivo estável neste projeto:

- `output/custom.markers.js`: concentra os marcadores customizados e também o overlay da malha ferroviária.

## Deploy no GitHub Pages

O deploy é feito por GitHub Actions publicando diretamente a pasta `output/`.

Fluxo:

1. Gere ou atualize o mapa em `output/`.
2. Commit e push para a branch `main`.
3. O workflow `Deploy uNmINeD Map` publica o conteúdo no GitHub Pages.

## Pré-requisito no repositório

No GitHub, configure o Pages para usar `GitHub Actions` como source de publicação.

## Observações operacionais

- Mudanças em `output/custom.markers.js` sobrevivem a novos renders.
- Mudanças diretas em `output/index.html` não devem ser consideradas persistentes.
- O deploy atual assume que `output/` já foi gerado localmente antes do push.
