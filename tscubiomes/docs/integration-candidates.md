# Candidatos de integracao futura com mine_mcp

Este documento registra ideias para uma futura integracao entre `tscubiomes` e `mine_mcp`. A integracao nao faz parte dos primeiros marcos.

Como o mundo do workspace e Bedrock, as tools futuras devem assumir `edition: "bedrock"` como default operacional quando chamadas dentro deste projeto. Java deve ser opcional e explicito.

## Tools candidatas

### `cubiomes_get_structure_attempt`

Entrada:

- `seed`
- `edition`
- `version`
- `structureType`
- `regionX`
- `regionZ`

Saida:

- coordenada de regiao;
- coordenada de chunk;
- coordenada de bloco;
- status de suporte.

### `cubiomes_scan_structures`

Entrada:

- `seed`
- `edition`
- `version`
- `structureType`
- `minX`
- `minZ`
- `maxX`
- `maxZ`

Saida:

- lista de tentativas de estrutura;
- distancia ate pontos registrados, quando aplicavel;
- avisos sobre biome check.

### `cubiomes_get_biome_at`

Entrada:

- `seed`
- `edition`
- `version`
- `dimension`
- `x`
- `y`
- `z`
- `scale`

Saida:

- ID do bioma;
- nome canonico;
- versao/dimensao;
- status de suporte.

### `cubiomes_compare_registered_points`

Entrada:

- `seed`
- `version`
- `edition`, com default Bedrock no workspace Minecraft.
- filtro opcional por tipo de ponto.

Saida:

- pontos do `mine_mcp`;
- estrutura/bioma esperado;
- estrutura/bioma calculado;
- divergencias.

## Riscos de integracao

- Acoplar o `mine_mcp` antes de estabilizar a API do `tscubiomes`.
- Confundir coordenadas de bloco, chunk e regiao.
- Tratar pontos Bedrock como contrato Java sem validacao.
- Tornar scans grandes lentos dentro de uma chamada MCP.
