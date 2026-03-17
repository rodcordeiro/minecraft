# mine_mcp

## Objetivo
- Servidor MCP em TypeScript para registrar e consultar pontos do mapa Minecraft a partir de coordenadas X/Z.

## Dados do workspace
- O mundo-fonte fica em `../world`.
- O render do uNmINeD fica em `../output`.
- Pontos registrados pelo MCP ficam em `./data/points.json`.

## Regras
- A arquitetura deve permanecer em TypeScript.
- Os testes usam Jest e devem cobrir persistencia e consultas principais para prevenir regressões.
- Testes validados e já configurados não devem ser alterados depois, a menos que isso seja estritamente solicitado.
