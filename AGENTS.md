# Workspace Notes

## Estrutura
- `world/`: save manual do mundo Minecraft MCPE. Este conteúdo pode ser atualizado manualmente de tempos em tempos.
- `output/`: render gerado pelo uNmINeD a partir do mundo.

## Geração do mapa
- Ferramenta base: `~/tools/unmined`
- Comando de render:

```powershell
unmined-cli web render --world ".\world" --dimension overworld --output ./output -c --players --shadows 3do -f
unmined-cli web render --world ".\world" --dimension nether --output ./output/nether -c --players --shadows 3do -f
```

## Regras
- O projeto MCP deste workspace se chama `mine_mcp`.
- Testes validados e já configurados não devem ser alterados depois, a menos que isso seja estritamente solicitado.
