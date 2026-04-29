# Backlog - tscubiomes

## Visao de PM

Esta demanda deve ser conduzida em marcos curtos, cada um entregando valor validavel. A prioridade nao e portar todo o `cubiomes`; e criar uma biblioteca TypeScript confiavel para responder perguntas praticas sobre seeds, estruturas e, depois, biomas.

Decisao de produto: o mundo alvo e Minecraft Bedrock. O projeto pode usar `cubiomes` como referencia para Java Edition e para aprender a arquitetura de geracao, mas o backlog precisa terminar com suporte Bedrock real.

Seed Bedrock de referencia do produto: `5547459079057001195`.

## Mapa das referencias

| Referencia | Uso no tscubiomes | Limite |
| --- | --- | --- |
| `cubiomes` | Arquitetura de API, fixtures Java, `Range`, `StructureConfig`, `getStructurePos`, `getBiomeAt` | Java Edition; nao valida o mundo Bedrock |
| `bedrock-cubiomes` | Layers/biomas Bedrock antigos e comparativo com cubiomes | Pode nao cobrir Bedrock moderno |
| `bedrockified` | `BedrockRandom`, normalizacao de seed legada, spawn, strongholds e patches Bedrock | Projeto historico 1.13.1; exige fixture por versao |
| `MCBEStructureFinder` | Estruturas Bedrock, configs e formulas candidatas para Village/Witch Hut | Licenca nao confirmada; ha trechos `todo`/`error` |

Direcao revisada: o MVP deve implementar primeiro estruturas Bedrock sem biome check. Java fica como trilha de paridade, nao como caminho critico.

Pontos reais para comparativo:

| Tipo | Nome | X | Z | Uso no backlog |
| --- | --- | ---: | ---: | --- |
| village | Alvorada Branca | -296 | -296 | Validar busca/scan de vilas proximas ao spawn/base |
| village | Ermo da Neve | -360 | 296 | Validar coordenadas negativas/positivas |
| village | Pinhal de Valkaria | 344 | -360 | Validar coordenadas positivas/negativas |
| witch_hut | Cabana de bruxa | 7432 | -2840 | Validar estrutura distante e regiao negativa em Z |

## Marco 0 - Fundacao deterministica

Objetivo: provar que TypeScript puro consegue reproduzir os calculos basicos usados por Minecraft/cubiomes.

### TSC-0001 - Criar scaffold do pacote

Escopo:

- Criar `package.json`, `tsconfig.json`, `src/index.ts` e estrutura inicial.
- Configurar scripts `build`, `typecheck` e `test`.
- Definir ESM como formato inicial.

Criterios de aceite:

- `pnpm run typecheck` executa sem erros.
- `pnpm run test` executa uma suite minima.
- `pnpm run build` gera saida em `dist/`.

### TSC-0002 - Definir politica numerica

Escopo:

- Criar helpers para `int32`, `uint32`, `int64`, `uint64`, mascara 48-bit e overflow modular.
- Documentar quando usar `number` e quando usar `bigint`.

Criterios de aceite:

- Seeds como `5547459079057001195` sao aceitas sem perda de precisao.
- Operacoes de mascara 48-bit retornam valores deterministicos.
- Testes cobrem valores negativos, coordenadas negativas e overflow.

### TSC-0003 - Portar Java Random

Escopo:

- Implementar `setSeed`, `next`, `nextInt`, `nextLong`, `nextFloat`, `nextDouble` e `skipNextN`.
- Usar `bigint` internamente.

Criterios de aceite:

- Sequencias geradas batem com fixtures de referencia.
- `nextInt` cobre o caminho de potencia de 2 e rejection sampling.
- API nao expoe mutacao acidental de estado.

### TSC-0003B - Portar BedrockRandom / MT19937

Escopo:

- Implementar RNG Bedrock baseado em MT19937 conforme `bedrockified/BedrockRandom.java` e `MCBEStructureFinder/be_random.cpp`.
- Implementar `nextUInt32`, `nextInt(bound)`, `nextFloat` e helper de geracao dos primeiros N valores.
- Usar aritmetica `uint32` deterministica.

Criterios de aceite:

- Sequencias batem com fixtures geradas a partir das referencias.
- `nextInt(bound)` usa modulo unsigned 32-bit, nao rejection sampling de Java.
- Testes cobrem seeds positivas, negativas convertidas para uint32 e limites de 32 bits.

### TSC-0003C - Definir politica de seed Bedrock por versao

Escopo:

- Documentar e implementar normalizacao de seed Bedrock.
- Separar modo legado 32-bit das seeds modernas 64-bit enquanto a versao do mundo nao for confirmada.
- Exigir versao ou perfil de seed quando houver ambiguidade.

Criterios de aceite:

- Seed `5547459079057001195` e preservada como string/bigint sem truncamento silencioso.
- Chamadas que exigirem seed 32-bit explicitam a conversao ou retornam erro de ambiguidade.
- Fixture registra a semantica de seed usada.

### TSC-0004 - Criar fixtures iniciais da seed do mundo

Escopo:

- Criar `fixtures/seed-5547459079057001195.json`.
- Registrar pontos reais do `mine_mcp` usados para validacao.
- Registrar edicao `bedrock`.
- Registrar versao Minecraft Bedrock usada para gerar as fixtures quando confirmada.

Criterios de aceite:

- Fixture contem seed em string.
- Fixture contem `edition: "bedrock"`.
- Fixture contem as 3 vilas e a cabana de bruxa.
- Fixture diferencia coordenada de bloco, coordenada de chunk e coordenada de regiao quando aplicavel.

### TSC-0005 - Modelar edicoes de Minecraft

Escopo:

- Criar tipo `MinecraftEdition = "java" | "bedrock"`.
- Exigir `edition` em APIs que dependem de geracao.
- Definir erro tipado para edicoes ainda nao implementadas.

Criterios de aceite:

- Nenhuma API publica de seed/estrutura/bioma assume Java implicitamente.
- Fixtures possuem `edition`.
- Chamadas Bedrock ainda nao implementadas retornam erro `UnsupportedEditionFeature` ou status equivalente.

## Marco 1 - Estruturas Bedrock sem biome check

Objetivo: permitir consultas de tentativa de estrutura Bedrock e slime chunks sem ainda depender do gerador completo de biomas. A implementacao Java pode existir para paridade, mas nao deve bloquear o MVP Bedrock.

### TSC-0101 - Mapear enums publicos

Escopo:

- Criar `MCVersion`, `Dimension`, `StructureType`, `BiomeId` minimo e flags.
- Garantir compatibilidade numerica com os headers do `cubiomes`.

Criterios de aceite:

- `Village` e `Swamp_Hut` existem em `StructureType`.
- `DIM_OVERWORLD` existe em `Dimension`.
- Versoes modernas ao menos `MC_1_18`, `MC_1_19`, `MC_1_20` e `MC_1_21` existem.

### TSC-0102 - Portar configuracao de estruturas

Escopo:

- Criar `StructureConfig` por edicao.
- Portar configs Bedrock necessarias para `Village` e `Swamp_Hut`:
  - `Village`: spacing `27`, spawnRange `17`, salt `10387312`, num `4`;
  - `Swamp_Hut`: usar config random scattered Bedrock, spacing `32`, spawnRange `24`, salt `14357617`, num `2`.
- Preparar extensao para outras estruturas depois, sem misturar configs Java.

Criterios de aceite:

- `getStructureConfig(StructureType.Village, version)` retorna config ou erro tipado.
- `getStructureConfig(StructureType.Swamp_Hut, version)` retorna config ou erro tipado.
- Versoes nao suportadas nao retornam dados silenciosamente.

### TSC-0103 - Portar posicao de tentativa de estrutura

Escopo:

- Implementar calculo Bedrock de candidato em regiao:
  - converter bloco -> chunk -> regiao com floor division;
  - calcular seed de area com salt, regionX e regionZ;
  - somar world seed conforme politica Bedrock definida;
  - gerar offsets por MT19937;
  - converter chunk candidato para bloco.
- Manter funcoes Java em modulo separado quando forem portadas.

Criterios de aceite:

- A seed `5547459079057001195` pode ser usada para calcular tentativas Bedrock de `Village`, se a politica de seed estiver confirmada.
- A seed `5547459079057001195` pode ser usada para calcular tentativas Bedrock de `Swamp_Hut`, se a politica de seed estiver confirmada.
- O calculo funciona para regioes com X/Z negativos.
- `Stronghold`, `Mineshaft`, `OceanRuin`, `Shipwreck`, `RuinedPortal`, `NetherFortress`, `Bastion` e `Endcity` retornam `unsupported` ate haver fixtures externas confiaveis.

### TSC-0104 - Criar scan simples de estruturas por area

Escopo:

- Criar `scanStructureAttempts`.
- Receber bounding box em blocos e converter para regioes da estrutura.

Criterios de aceite:

- Scan em torno de `Alvorada Branca`, `Ermo da Neve` e `Pinhal de Valkaria` retorna candidatos de vila proximos aos pontos registrados, conforme tolerancia definida em `validation-plan.md`.
- Scan em torno da `Cabana de bruxa` retorna candidato de `Swamp_Hut` proximo ao ponto registrado.
- Resultado explicita `attempt`, `region`, `chunk` e `block`.

### TSC-0105 - Portar slime chunk

Escopo:

- Implementar `isSlimeChunk(seed, chunkX, chunkZ)`.

Criterios de aceite:

- API aceita seed como `bigint` ou string.
- API rejeita coordenadas de bloco quando configurada em modo estrito.
- Testes cobrem chunks positivos e negativos.

### TSC-0106 - Pesquisa tecnica de seed/estrutura Bedrock

Escopo:

- Consolidar os achados de `bedrockified`, `bedrock-cubiomes` e `MCBEStructureFinder`.
- Confirmar licenca/uso permitido de `MCBEStructureFinder` antes de qualquer port literal.
- Confirmar como a versao Bedrock alvo trata seed 64-bit.
- Definir fontes de fixture Bedrock independentes do `cubiomes` Java.

Criterios de aceite:

- Documento tecnico registra fontes, algoritmos candidatos e lacunas.
- `docs/reference-assessment.md` esta atualizado quando novos achados mudarem o plano.
- Vilas e cabana da seed `5547459079057001195` ficam como casos de validacao Bedrock.
- Proxima task de implementacao Bedrock fica desbloqueada.

### TSC-0107 - Criar matriz de suporte de estruturas Bedrock

Escopo:

- Classificar estruturas em `supported`, `experimental` e `blocked`.
- Registrar fonte, algoritmo, necessidade de biome check e fixture minima por estrutura.
- Comecar com `Village` e `Swamp_Hut` como `experimental` ate validacao por mundo real.

Criterios de aceite:

- Estruturas sem fixture retornam `unsupported` na API publica.
- A matriz separa candidato de estrutura e viabilidade por bioma.
- O documento lista explicitamente quais estruturas dependem de validacao externa por `/locate` ou ferramenta Bedrock.

## Marco 2 - Validacao de viabilidade por bioma

Objetivo: diferenciar tentativa de estrutura de estrutura realmente viavel, usando biomas quando necessario.

### TSC-0201 - Portar helpers basicos de bioma

Escopo:

- Implementar `biomeExists`, `getDimension`, `isOverworld`, `isOceanic`, `isSnowy` e lookup nome/ID.

Criterios de aceite:

- Biomas dos pontos registrados podem ser representados por nome: `snowy_plains`, `snowy_taiga`, `swamp`.
- Biomas inexistentes para versao retornam erro tipado ou `false`, conforme API.

### TSC-0202 - Portar `isViableFeatureBiome` para Village e Swamp_Hut

Escopo:

- Implementar regras de bioma por estrutura para o subconjunto do produto.

Criterios de aceite:

- `Village` valida biomas de vila suportados para a versao escolhida.
- `Swamp_Hut` valida bioma de pantano/mangue conforme versao.
- Lacunas por versao ficam documentadas.

### TSC-0203 - Implementar `isViableStructurePos` parcial

Escopo:

- Validar `Village` e `Swamp_Hut` usando gerador de bioma disponivel no momento.
- Caso o gerador completo ainda nao exista, expor status `unknown` em vez de resultado falso.

Criterios de aceite:

- API distingue `attempt_found`, `biome_viable`, `biome_unknown` e `not_found`.
- Pontos reais da seed `5547459079057001195` sao usados como testes de comparativo.

## Marco 2B - Primeira engine Bedrock

Objetivo: iniciar suporte Bedrock real com o menor conjunto capaz de validar os pontos do mundo do usuario.

### TSC-02B1 - Criar contrato da engine Bedrock

Escopo:

- Criar interface interna `WorldgenEngine`.
- Implementar stub `BedrockEngine`.
- Definir saidas comuns para Java e Bedrock.

Criterios de aceite:

- API publica escolhe engine por `edition`.
- Bedrock retorna status explicito para features pendentes.
- Testes garantem que Java e Bedrock nao compartilham caminho por acidente.

### TSC-02B2 - Implementar interpretacao inicial de seed Bedrock

Escopo:

- Implementar parsing e normalizacao de seed Bedrock.
- Definir limites numericos e conversoes usados por Bedrock.

Criterios de aceite:

- Seed `5547459079057001195` e aceita como Bedrock sem perda de precisao.
- Seeds string e bigint sao suportadas.
- Seeds fora do range documentado retornam erro claro.

### TSC-02B3 - Implementar scan Bedrock minimo para pontos conhecidos

Escopo:

- Implementar ou encapsular algoritmo Bedrock inicial para localizar/validar `Village` e `Swamp_Hut`, conforme pesquisa tecnica.
- Priorizar area ao redor dos pontos reais.

Criterios de aceite:

- `Alvorada Branca`, `Ermo da Neve`, `Pinhal de Valkaria` e `Cabana de bruxa` aparecem como correspondencias Bedrock dentro da tolerancia documentada.
- Resultado informa se a match veio de tentativa, estrutura viavel ou fixture/verificacao parcial.
- Divergencias sao registradas com hipotese tecnica.

## Marco 3 - Geracao de biomas por layers ate 1.17

Objetivo: iniciar `getBiomeAt` e `genBiomes` para versoes antigas, onde o modelo por camadas e mais direto de portar.

### TSC-0301 - Modelar `Range`, `Layer` e `LayerStack`

Escopo:

- Criar tipos e classes internas equivalentes aos conceitos do `cubiomes`.
- Evitar ponteiros e mutacao global.

Criterios de aceite:

- `Range` suporta escala, posicao horizontal e faixa vertical.
- `LayerStack` representa entradas por escala.

### TSC-0302 - Portar layers essenciais em ordem de dependencia

Escopo:

- Portar continent, zoom, land, snow, biome, river, shore, ocean mix e voronoi.

Criterios de aceite:

- Cada layer tem teste de fixture proprio.
- Coordenadas negativas sao cobertas.

### TSC-0303 - Implementar `getBiomeAt` pre-1.18

Escopo:

- Implementar `createGenerator`, `applySeed` e `getBiomeAt` para Overworld ate 1.17.

Criterios de aceite:

- Testes de hash baseados no `tests.c` passam para versoes implementadas.
- API retorna erro claro para 1.18+ neste marco.

## Marco 4 - Noise moderno e biomas 1.18+

Objetivo: suportar o fluxo moderno necessario para seeds atuais, separando explicitamente Java moderno e Bedrock moderno.

### TSC-0401 - Portar Xoroshiro128

Escopo:

- Implementar RNG moderno usado por partes da geracao 1.18+.

Criterios de aceite:

- Sequencias batem com fixtures.
- Rotacoes e overflow 64-bit usam `bigint`.

### TSC-0402 - Portar Perlin, Octave e DoublePerlin

Escopo:

- Implementar noise base necessario para Nether, End e Overworld moderno.

Criterios de aceite:

- Samples batem com fixtures.
- Nao ha uso de aleatoriedade nativa do JavaScript.

### TSC-0403 - Portar biome noise 1.18+

Escopo:

- Portar climate parameters, biome tree tables e `sampleBiomeNoise`.

Criterios de aceite:

- A seed `5547459079057001195` pode ser consultada em pontos das vilas e cabana.
- `getBiomeAt` retorna biomas esperados ou divergencia documentada.

### TSC-0404 - Implementar `getBiomeAt` Bedrock para versao alvo

Escopo:

- Implementar consulta de bioma Bedrock para a versao alvo do mundo.
- Validar primeiro os pontos conhecidos.

Criterios de aceite:

- `getBiomeAt({ edition: "bedrock", seed: "5547459079057001195", ... })` retorna biomas compativeis com os hints dos pontos reais.
- Resultado diferencia bioma calculado de hint/manual.
- Versoes Bedrock nao implementadas retornam erro tipado.

## Marco 5 - API, CLI e integracao futura

Objetivo: tornar o pacote consumivel por scripts, MCPs e futuras tools.

### TSC-0501 - Criar API publica funcional

Escopo:

- Exportar `getStructurePos`, `scanStructureAttempts`, `isSlimeChunk`, `getBiomeAt`.

Criterios de aceite:

- API tem tipos estaveis.
- Exemplos de uso ficam no README.

### TSC-0502 - Criar CLI JSON

Escopo:

- Criar comandos `structure-pos`, `scan-structures`, `slime-chunk`, `biome-at`.

Criterios de aceite:

- Saida e JSON por padrao.
- CLI retorna exit code previsivel.

### TSC-0503 - Planejar integracao com `mine_mcp`

Escopo:

- Definir tools MCP candidatas sem implementar ainda.

Criterios de aceite:

- Documento lista tools, inputs, outputs e riscos.
- Nenhuma mudanca em `mine_mcp` antes de API minima do `tscubiomes`.

### TSC-0504 - Integrar Bedrock ao `mine_mcp`

Escopo:

- Criar plano de tools MCP usando `edition: "bedrock"` como default do workspace.
- Comparar pontos registrados do `mine_mcp` com resultados calculados pelo `tscubiomes`.

Criterios de aceite:

- Plano define inputs/outputs das tools Bedrock.
- Pontos do mundo do usuario sao o primeiro caso de aceite.
- Java permanece opcional, nao default, neste workspace.
