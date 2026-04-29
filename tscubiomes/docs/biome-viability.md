# Viabilidade por bioma - Marco 2

## Escopo

O Marco 2 adiciona validacao parcial de viabilidade por bioma. Ele nao implementa `getBiomeAt` e nao calcula bioma real a partir da seed.

O objetivo e permitir que uma tentativa de estrutura do Marco 1 seja classificada quando houver um bioma conhecido por hint, fixture ou futura engine.

## Contratos

### Registry de biomas

`src/biomes/registry.ts` expoe um catalogo minimo com:

- `biomeExists`;
- `getBiome`;
- `getBiomeId`;
- `getDimension`;
- `isOverworld`;
- `isOceanic`;
- `isSnowy`;
- `listBiomes`.

Biomas usados pelos pontos reais:

- `snowy_plains`;
- `snowy_taiga`;
- `swamp`.

`mangrove_swamp` existe no registry, mas nao e considerado viavel para `Swamp_Hut` neste marco porque falta confirmacao por versao/fixture Bedrock.

### `isViableFeatureBiome`

Regra pura de estrutura contra bioma informado:

- `Village`: aceita `plains`, `sunflower_plains`, `savanna`, `desert`, `taiga`, `taiga_hills`, `snowy_plains`, `snowy_taiga`, `snowy_taiga_hills`.
- `Swamp_Hut`: aceita `swamp`.

Estruturas fora desse subconjunto retornam erro tipado.

### `isViableStructurePos`

Orquestra tentativa de estrutura e bioma conhecido.

Statuses:

- `not_found`: nao houve tentativa;
- `biome_unknown`: houve tentativa, mas nao ha bioma conhecido;
- `biome_viable`: o bioma informado e aceito;
- `biome_not_viable`: o bioma informado existe, mas nao atende a estrutura.

Quando um bioma e informado, o resultado tambem pode registrar `biomeSource`:

- `manual`;
- `fixture`;
- `engine`.

Enquanto `getBiomeAt` nao existir, resultados com `biomeSource: "manual"` ou `"fixture"` nao provam geracao real no mundo; apenas classificam a tentativa com base no bioma informado.

## Fora de escopo

- Gerar biomas a partir da seed;
- validar area completa de bioma ao redor da estrutura;
- promover suporte Bedrock para estruturas bloqueadas;
- resolver a semantica moderna 32-bit/64-bit da seed Bedrock.
