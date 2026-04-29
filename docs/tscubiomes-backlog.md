# Backlog para criacao do tscubiomes

## Objetivo

Criar uma biblioteca TypeScript chamada `tscubiomes`, inspirada em `Cubitect/cubiomes`, para consultar biomas, estruturas e propriedades de seeds do Minecraft Java Edition sem depender diretamente de codigo nativo em C.

O objetivo inicial nao e portar 100% do `cubiomes` de uma vez. A proposta recomendada e evoluir por compatibilidade verificavel contra a implementacao C, com uma API TypeScript estavel e foco primeiro nos casos de uso de maior valor para MCPs e automacoes.

## Contexto usado

Foram avaliados os arquivos principais do clone local em `cubiomes/`:

- `README.md`: exemplos publicos de uso e escopo da biblioteca.
- `rng.h`: Java Random, Xoroshiro128, seed helpers e aritmetica de suporte.
- `biomes.h`: versoes Minecraft, dimensoes, IDs de bioma e helpers.
- `generator.h`: API central de geracao de biomas.
- `layers.h`: geracao por camadas para Overworld ate 1.17.
- `noise.h` e `biomenoise.h`: Perlin, DoublePerlin, Nether, End e Overworld 1.18+.
- `finders.h`: estruturas, slime chunks, strongholds, spawn e filtros.
- `tests.c`: hashes de referencia e exemplos de validacao.
- `makefile`: composicao da lib C e flags relevantes, incluindo `-fwrapv`.

## Premissas

- O escopo tecnico de `cubiomes` e Minecraft Java Edition, nao Bedrock/MCPE.
- TypeScript deve usar `bigint` para sementes e estados de RNG de 48 e 64 bits.
- O pacote deve ser utilizavel em Node.js primeiro; suporte browser pode ser posterior.
- A implementacao deve priorizar determinismo e paridade com Java/C antes de performance.
- A API publica deve esconder detalhes de port do C, mas preservar conceitos essenciais como `MCVersion`, `Dimension`, `BiomeId`, `Range`, `StructureType` e `Generator`.

## Decisao recomendada

Construir `tscubiomes` como port TypeScript incremental, com suite de paridade contra fixtures geradas pelo `cubiomes` C.

Nao recomendo comecar por um port completo do gerador 1.18+, porque ele depende de noise, splines, tabelas de biome tree e muitos detalhes de performance. O melhor MVP e:

1. constantes, tipos e helpers de biomas;
2. Java Random/Xoroshiro/seed helpers;
3. slime chunks e posicoes de estruturas por regiao;
4. `getBiomeAt` e `genBiomes` apenas depois, por versao/dimensao priorizada.

## Arquitetura proposta

Estrutura inicial sugerida:

```text
tscubiomes/
  src/
    index.ts
    versions.ts
    biomes.ts
    dimensions.ts
    rng/
      java-random.ts
      xoroshiro.ts
      seed.ts
      int64.ts
    structures/
      types.ts
      configs.ts
      positions.ts
      slime.ts
    generator/
      range.ts
      generator.ts
      biome-at.ts
    layers/
      layer.ts
      layer-stack.ts
    noise/
      perlin.ts
      octave.ts
      double-perlin.ts
    fixtures/
    __tests__/
```

API publica minima:

```ts
import {
  MCVersion,
  Dimension,
  BiomeId,
  StructureType,
  createGenerator,
  getBiomeAt,
  getStructurePos,
  isSlimeChunk
} from "tscubiomes";
```

## Backlog

### EPIC 1 - Fundacao do pacote TypeScript

**TSB-001 - Criar scaffold do pacote**

- Escopo: criar `package.json`, `tsconfig`, `src/index.ts`, estrutura de pastas e scripts de `test`, `typecheck` e `build`.
- Criterios de aceite:
  - pacote compila em ESM;
  - tipos sao exportados pela raiz;
  - build gera `dist/` com `.d.ts`;
  - testes rodam localmente.
- Risco: baixo.

**TSB-002 - Definir politica numerica**

- Escopo: documentar e implementar helpers para operacoes de 32, 48 e 64 bits usando `bigint`, incluindo mascaras e conversoes assinadas quando necessario.
- Criterios de aceite:
  - helpers cobrem overflow de 64 bits, mascara 48 bits e shift/logica usados em seeds;
  - existe teste de regressao para casos negativos e overflow;
  - docs explicam quando usar `number` e quando usar `bigint`.
- Risco: alto, porque divergencias pequenas quebram paridade.

**TSB-003 - Mapear enums e constantes publicas**

- Escopo: portar `MCVersion`, `Dimension`, `BiomeId`, flags de generator e `StructureType`.
- Criterios de aceite:
  - nomes TypeScript estaveis e legiveis;
  - aliases historicos do C tratados ou explicitamente descartados;
  - compatibilidade de IDs numericos com `biomes.h` e `finders.h`.
- Risco: medio.

### EPIC 2 - RNG e seed helpers

**TSB-010 - Portar Java Random**

- Escopo: portar `setSeed`, `next`, `nextInt`, `nextLong`, `nextFloat`, `nextDouble` e `skipNextN`.
- Criterios de aceite:
  - resultados batem com fixtures do C para seeds fixas;
  - `nextInt` cobre caminho power-of-two e rejection sampling;
  - API nao expoe estado mutavel sem controle.
- Risco: alto.

**TSB-011 - Portar Xoroshiro128**

- Escopo: portar `xSetSeed`, `xNextLong`, `xNextInt`, `xNextDouble`, `xNextFloat`, `xSkipN`, `xNextLongJ` e `xNextIntJ`.
- Criterios de aceite:
  - fixtures validam sequencias para multiplas seeds;
  - operacoes de rotate 64-bit preservam overflow.
- Risco: alto.

**TSB-012 - Portar seed helpers de camadas**

- Escopo: portar `mcStepSeed`, `mcFirstInt`, `mcFirstIsZero`, `getChunkSeed`, `getLayerSalt`, `getStartSalt` e `getStartSeed`.
- Criterios de aceite:
  - resultados batem com fixtures do C;
  - helpers sao internos ou marcados como avancados.
- Risco: medio.

### EPIC 3 - Biomas e metadados

**TSB-020 - Portar helpers de biomas**

- Escopo: portar `biomeExists`, `isOverworld`, `getDimension`, `getMutated`, `getCategory`, `areSimilar`, `isMesa`, `isShallowOcean`, `isDeepOcean`, `isOceanic` e `isSnowy`.
- Criterios de aceite:
  - cobertura por versoes principais de `MC_B1_8` a `MC_1_21`;
  - fixtures com matriz de biomas representativos;
  - funcoes retornam valores previsiveis para biomas inexistentes.
- Risco: medio.

**TSB-021 - Criar nomes e lookup de biomas**

- Escopo: criar mapas `id -> name`, `name -> id`, categorias e helpers amigaveis.
- Criterios de aceite:
  - API aceita IDs e nomes canonicos;
  - nomes antigos podem ser resolvidos como aliases;
  - retorno documenta nome canonico.
- Risco: baixo.

### EPIC 4 - Estruturas sem biome check

**TSB-030 - Portar configuracoes de estruturas**

- Escopo: portar `StructureConfig` e `getStructureConfig` para versoes suportadas.
- Criterios de aceite:
  - cobre estruturas de `finders.h`, incluindo `Village`, `Swamp_Hut`, `Outpost`, `Fortress`, `Bastion`, `Ancient_City`, `Trail_Ruins` e `Trial_Chambers`;
  - casos nao suportados retornam erro tipado.
- Risco: medio.

**TSB-031 - Portar posicao de tentativa de estrutura**

- Escopo: portar `getFeatureChunkInRegion`, `getFeaturePos`, `getLargeStructureChunkInRegion`, `getLargeStructurePos`, `getStructurePos` e `moveStructure`.
- Criterios de aceite:
  - resultados batem com fixtures para seeds, regioes e versoes variadas;
  - retorno diferencia `invalid region` de erro de configuracao;
  - aceita seed 64-bit, mas documenta que muitas estruturas usam apenas lower 48 bits.
- Risco: alto.

**TSB-032 - Portar slime chunk**

- Escopo: portar `isSlimeChunk`.
- Criterios de aceite:
  - fixtures validam chunks positivos e negativos;
  - API aceita coordenadas de chunk, nao bloco.
- Risco: baixo.

**TSB-033 - Portar mineshafts e estruturas simples**

- Escopo: avaliar e portar `getMineshafts` e estruturas cuja posicao nao exige noise/biome check complexo.
- Criterios de aceite:
  - fixtures por area;
  - performance aceitavel para scans pequenos.
- Risco: medio.

### EPIC 5 - Gerador de biomas ate 1.17 por layers

**TSB-040 - Portar modelo de Layer e LayerStack**

- Escopo: representar `Layer`, `LayerStack`, entrada por escala e relacoes parentais sem ponteiros.
- Criterios de aceite:
  - suporta setup de stack por versao;
  - estado de seed por layer e deterministico;
  - design evita mutacao global acidental.
- Risco: alto.

**TSB-041 - Portar map functions essenciais**

- Escopo: portar funcoes de layer em ordem de dependencia: continent, zoom, land, snow, cool/heat, special, mushroom, deep ocean, biome, river, shore, ocean e voronoi.
- Criterios de aceite:
  - testes incrementais por layer com fixtures C;
  - suporte inicial para `MC_1_7`, `MC_1_12` e `MC_1_16/1.17`;
  - flags `LARGE_BIOMES` e ocean variants documentadas.
- Risco: alto.

**TSB-042 - Implementar `getBiomeAt` para versoes ate 1.17**

- Escopo: implementar `setupGenerator`, `applySeed`, `getBiomeAt` e `genBiomes` para Overworld layered.
- Criterios de aceite:
  - reproduz hashes de `tests.c` para 1x1 quick e thorough nas versoes suportadas;
  - suporta escalas 1, 4, 16, 64 e 256 quando aplicavel;
  - erro claro para dimensoes/versoes nao implementadas.
- Risco: alto.

### EPIC 6 - Noise base

**TSB-050 - Portar PerlinNoise**

- Escopo: portar inicializacao e sampling de Perlin, incluindo simplex 2D.
- Criterios de aceite:
  - fixtures de sampling para seeds e coordenadas fixas;
  - sem uso de `Math.random`;
  - comportamento de precisao documentado.
- Risco: alto.

**TSB-051 - Portar OctaveNoise e DoublePerlinNoise**

- Escopo: portar inicializacao e sampling de octave e double perlin.
- Criterios de aceite:
  - fixtures para octave beta, octave amp e double perlin;
  - API interna suficiente para Nether, End e 1.18+.
- Risco: alto.

### EPIC 7 - Nether, End e Overworld 1.18+

**TSB-060 - Portar Nether 1.16+**

- Escopo: portar `setNetherSeed`, `getNetherBiome`, `mapNether2D`, `mapNether3D` e `genNetherScaled`.
- Criterios de aceite:
  - fixtures por seed e area;
  - suporte a escala 4 antes de escalas superiores;
  - documenta limitacoes de confidence/otimizacao.
- Risco: alto.

**TSB-061 - Portar End 1.9+**

- Escopo: portar `setEndSeed`, `mapEndBiome`, `mapEnd`, `getEndSurfaceHeight` e geracao escalada.
- Criterios de aceite:
  - fixtures para biomas e altura em areas pequenas;
  - suporte inicial a escala 16/4 antes de escala 1.
- Risco: alto.

**TSB-062 - Portar biome noise 1.18+**

- Escopo: portar `BiomeNoise`, climate parameters, biome tree tables, `sampleBiomeNoise`, `climateToBiome` e `genBiomeNoiseScaled`.
- Criterios de aceite:
  - suporta pelo menos `MC_1_18`, `MC_1_20` e `MC_1_21`;
  - fixtures de `getBiomeAt` para seeds e coordenadas conhecidas;
  - paridade medida contra `cubiomes` para areas pequenas.
- Risco: muito alto.

**TSB-063 - Portar splines e tabelas de biome tree**

- Escopo: converter `tables/btree*.h` e estruturas `Spline`, `SplineStack`, `BiomeTree` para TypeScript.
- Criterios de aceite:
  - geracao ou conversao automatizada das tabelas;
  - teste garante que tabelas convertidas preservam tamanho e hashes;
  - evitar edicao manual de tabelas grandes.
- Risco: alto.

### EPIC 8 - Biome checks e estruturas avancadas

**TSB-070 - Portar `isViableFeatureBiome`**

- Escopo: portar validacao de bioma por estrutura e versao.
- Criterios de aceite:
  - fixtures por estrutura comum;
  - API separa tentativa de estrutura de viabilidade por bioma.
- Risco: medio.

**TSB-071 - Portar `isViableStructurePos`**

- Escopo: implementar biome check completo para estruturas suportadas.
- Criterios de aceite:
  - cobre ao menos Village, Swamp Hut, Outpost, Monument, Mansion, Fortress e Bastion;
  - documenta falsos positivos conhecidos em 1.18+ por falta de block-level terrain;
  - testes contra `findStructures` em areas pequenas.
- Risco: alto.

**TSB-072 - Portar strongholds**

- Escopo: portar `initFirstStronghold` e `nextStronghold`.
- Criterios de aceite:
  - iteracao gera posicoes aproximadas e precisas quando generator esta disponivel;
  - API permite limitar quantidade de strongholds;
  - fixtures para seed conhecida do README.
- Risco: alto.

**TSB-073 - Portar spawn**

- Escopo: portar `estimateSpawn`, `getSpawn` e `locateBiome`.
- Criterios de aceite:
  - expor `estimateSpawn` como API preferencial;
  - `getSpawn` marcado como lento e potencialmente impreciso;
  - testes com tolerancia/documentacao de incerteza.
- Risco: alto.

### EPIC 9 - API de alto nivel e DX

**TSB-080 - Criar API orientada a objetos**

- Escopo: criar `Generator` TypeScript com `setup`, `applySeed`, `getBiomeAt`, `genBiomes` e helpers.
- Criterios de aceite:
  - uso simples para scripts;
  - estado interno nao vaza;
  - erros tipados para combinacoes nao suportadas.
- Risco: medio.

**TSB-081 - Criar API funcional**

- Escopo: expor funcoes puras para casos comuns: `getBiomeAt`, `getStructurePos`, `isSlimeChunk`, `findStructuresInArea`.
- Criterios de aceite:
  - API funcional usa defaults claros;
  - adequada para MCP/tools;
  - exemplos no README.
- Risco: baixo.

**TSB-082 - Criar CLI opcional**

- Escopo: `tscubiomes biome-at`, `structure-pos`, `slime-chunk`, `scan-structures`.
- Criterios de aceite:
  - saida JSON por padrao;
  - argumentos validam versao, dimensao e seed;
  - exit codes previsiveis.
- Risco: baixo.

### EPIC 10 - Fixtures, paridade e qualidade

**TSB-090 - Criar harness de fixtures contra C**

- Escopo: criar scripts que compilam/executam pequenos programas C ou usam binario auxiliar para gerar fixtures JSON.
- Criterios de aceite:
  - fixtures versionadas para RNG, estruturas e biomas;
  - scripts documentados;
  - fixtures pequenas o suficiente para o repositorio.
- Risco: medio.

**TSB-091 - Portar hashes de `tests.c`**

- Escopo: reproduzir testes quick/thorough de `testBiomeGen1x1` como testes TypeScript.
- Criterios de aceite:
  - hashes batem para as versoes implementadas;
  - testes pendentes/skip documentam versoes ainda nao portadas.
- Risco: medio.

**TSB-092 - Benchmark basico**

- Escopo: medir `isSlimeChunk`, `getStructurePos`, `getBiomeAt` e `genBiomes`.
- Criterios de aceite:
  - benchmark nao bloqueia suite normal;
  - resultados documentam baseline;
  - gargalos viram issues especificas.
- Risco: baixo.

## Roadmap recomendado

### Marco 0 - Spike tecnico

Entregas:

- scaffold TypeScript;
- Java Random;
- Xoroshiro;
- `isSlimeChunk`;
- `getStructurePos` para um subconjunto de estruturas.

Valor: valida a viabilidade numerica do port e ja entrega funcoes uteis para automacoes.

### Marco 1 - tscubiomes core

Entregas:

- constantes e helpers de biomas;
- estrutura configs;
- posicoes de estruturas;
- CLI JSON;
- fixtures contra C.

Valor: biblioteca utilizavel para MCPs sem ainda resolver biome generation completa.

### Marco 2 - biomas pre-1.18

Entregas:

- layer stack;
- `getBiomeAt` e `genBiomes` para Overworld ate 1.17;
- hashes de `tests.c` passando para versoes escolhidas.

Valor: primeira geracao real de biomas.

### Marco 3 - noise e 1.18+

Entregas:

- Perlin/Octave/DoublePerlin;
- Nether e End;
- Overworld 1.18+ com biome tree tables.

Valor: aproxima o pacote do escopo moderno do cubiomes.

### Marco 4 - estruturas com viabilidade

Entregas:

- biome checks;
- strongholds;
- spawn;
- busca de estruturas por area.

Valor: funcionalidades comparaveis aos casos de uso principais do `cubiomes`.

## Riscos principais

- **Precisao numerica**: Java/C dependem de overflow assinado, mascara 48-bit e comportamento exato de RNG. TypeScript precisa de `bigint` disciplinado.
- **Performance**: port puro em TypeScript pode ser suficiente para consultas e scans pequenos, mas nao para busca massiva de seeds.
- **1.18+ e tabelas**: biome noise moderno e biome trees sao o maior custo de port.
- **Paridade incompleta**: sem fixtures contra C, e facil criar uma biblioteca que parece correta mas diverge em coordenadas negativas ou seeds altas.
- **Escopo Bedrock**: o pacote deve declarar explicitamente suporte a Minecraft Java Edition; nao deve prometer compatibilidade com mundos MCPE/Bedrock.

## Fora de escopo inicial

- Geracao block-level do mundo.
- Suporte Bedrock/MCPE.
- Busca massiva multithread de seeds equivalente ao C.
- Renderer de mapa.
- Integração direta com `mine_mcp`; isso deve ser feito depois que o pacote tiver API minima estavel.

## Proximo passo recomendado

Criar um novo diretorio/pacote `tscubiomes/` separado de `mine_mcp/`, implementar o Marco 0 e gerar fixtures pequenas a partir do `cubiomes` C. A primeira validacao tecnica deve ser: uma mesma seed/chunk retornar o mesmo resultado para `isSlimeChunk` e uma mesma seed/regiao retornar a mesma tentativa de estrutura para `getStructurePos`.
