# tscubiomes

Projeto planejado para portar, de forma incremental e em TypeScript, funcionalidades selecionadas do `Cubitect/cubiomes` e evoluir para interpretacao de seeds Minecraft Bedrock.

O objetivo e fornecer uma biblioteca deterministica para consultar seeds, estruturas e biomas, tratando Minecraft Java Edition e Minecraft Bedrock como engines distintas. O mundo alvo deste workspace e Bedrock; portanto, suporte Bedrock e requisito final do projeto. O `cubiomes` entra como referencia tecnica parcial para algoritmos Java e como base comparativa, nao como limite de escopo.

Documentacao inicial:

- `docs/project-charter.md`
- `docs/reference-assessment.md`
- `docs/bedrock-structure-support.md`
- `docs/biome-viability.md`
- `docs/mvp-api-cli.md`
- `docs/backlog.md`
- `docs/acceptance-criteria.md`
- `docs/validation-plan.md`

## Marco 0

O scaffold inicial expoe:

- helpers numericos para `int32`, `uint32`, `uint64`, mascara 48-bit e divisao por piso;
- `JavaRandom` para paridade com `java.util.Random`;
- `BedrockRandom` baseado em MT19937;
- parsing de seed Bedrock com politicas `preserve-64` e `legacy-32`;
- fixture inicial da seed Bedrock `5547459079057001195`.

## Marco 1

O suporte inicial de estruturas Bedrock inclui:

- configs experimentais de `Village` e `Swamp_Hut`;
- calculo de candidato por regiao com MT19937;
- scan simples por bounding box em blocos;
- matriz de suporte em `docs/bedrock-structure-support.md`;
- `isSlimeChunk` separado por edicao.

Enquanto a versao Bedrock e a semantica moderna da seed nao forem confirmadas, chamadas de estrutura com a seed real exigem `seedPolicy: "legacy-32"` para usar as formulas antigas das referencias locais.

## Marco 2

O suporte parcial de viabilidade por bioma inclui:

- registry minimo de biomas e aliases;
- helpers `biomeExists`, `getDimension`, `isOverworld`, `isOceanic` e `isSnowy`;
- `isViableFeatureBiome` para `Village` e `Swamp_Hut`;
- `isViableStructurePos` retornando `biome_unknown` quando nao houver bioma calculado/informado;
- `biomeSource` para diferenciar bioma manual, fixture e futura engine.

## MVP API e CLI

O MVP expoe `bedrockEngine`, API publica e CLI JSON. Consulte `docs/mvp-api-cli.md`.

Exemplo para sugerir duas vilas candidatas ainda nao mapeadas:

```powershell
node dist/cli.js suggest-villages --seed 5547459079057001195 --seed-policy legacy-32 --fixture fixtures/seed-5547459079057001195.json --radius 2500 --limit 2 --exclude-distance 256
```

Comandos:

```powershell
pnpm install --ignore-scripts
pnpm run typecheck
pnpm run test
pnpm run build
```
