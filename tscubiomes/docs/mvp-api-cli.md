# MVP API e CLI

## Escopo

O MVP publica uma API TypeScript e uma CLI JSON para consultas Bedrock-first usando os algoritmos ja implementados.

O pacote nao calcula bioma real por seed neste momento. `getBiomeAt` retorna `unsupported` explicitamente.

## API publica

Exports principais:

- `bedrockEngine`;
- `getBedrockStructureCandidate`;
- `scanBedrockStructureAttempts`;
- `isSlimeChunk`;
- `isViableStructurePos`;
- `suggestUnmappedVillages`.

## CLI

Todos os comandos retornam JSON.

### `structure-pos`

```powershell
node dist/cli.js structure-pos --seed 5547459079057001195 --seed-policy legacy-32 --structure Village --region-x 0 --region-z 0
```

### `scan-structures`

```powershell
node dist/cli.js scan-structures --seed 5547459079057001195 --seed-policy legacy-32 --structure Village --min-x -1000 --min-z -1000 --max-x 1000 --max-z 1000
```

### `slime-chunk`

```powershell
node dist/cli.js slime-chunk --chunk-x -20 --chunk-z -19
```

### `biome-at`

```powershell
node dist/cli.js biome-at --seed 5547459079057001195 --x 0 --z 0
```

Retorno esperado no MVP:

```json
{
  "status": "unsupported",
  "reason": "Bedrock getBiomeAt is not implemented yet. Use biome hints/fixtures with isViableStructurePos."
}
```

### `suggest-villages`

```powershell
node dist/cli.js suggest-villages --seed 5547459079057001195 --seed-policy legacy-32 --fixture fixtures/seed-5547459079057001195.json --radius 2500 --limit 2 --exclude-distance 256
```

O resultado lista candidatos de vila ainda nao mapeados, excluindo vilas conhecidas da fixture por distancia.

## Risco operacional

Os resultados de estrutura usam `seedPolicy: "legacy-32"` porque as referencias Bedrock locais usam formulas antigas de seed 32-bit. Isso e adequado para double check, mas nao substitui validacao por `/locate` ou ferramenta Bedrock externa.
