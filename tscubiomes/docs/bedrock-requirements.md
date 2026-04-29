# Requisitos Bedrock - tscubiomes

## Contexto

O mundo alvo do workspace Minecraft e Bedrock. Portanto, `tscubiomes` nao pode ser considerado concluido se interpretar apenas seeds Java Edition.

`Cubitect/cubiomes` continua util como referencia de arquitetura e paridade Java, mas nao cobre o requisito final sozinho.

## Requisito de produto

Ao final do projeto, `tscubiomes` deve ser capaz de interpretar a seed Bedrock `5547459079057001195` e validar pontos reais registrados no workspace.

## Casos de aceite Bedrock

| Tipo | Nome | X | Z |
| --- | --- | ---: | ---: |
| Village | Alvorada Branca | -296 | -296 |
| Village | Ermo da Neve | -360 | 296 |
| Village | Pinhal de Valkaria | 344 | -360 |
| Swamp Hut | Cabana de bruxa | 7432 | -2840 |

## Requisitos tecnicos

- Todas as APIs dependentes de geracao devem aceitar `edition`.
- `edition: "bedrock"` deve ter engine propria, separada de `edition: "java"`.
- O pacote nao pode retornar resultado Java quando a chamada pede Bedrock.
- Funcionalidades Bedrock ainda nao implementadas devem retornar erro/status explicito.
- Fixtures Bedrock devem ficar separadas de fixtures Java.
- RNG Bedrock deve ser modelado separadamente do `JavaRandom`.
- Configuracoes de estrutura Bedrock devem usar `spacing`, `spawnRange`, `salt` e `num` proprios.
- Seed Bedrock deve ser versionada por semantica: legado 32-bit e moderno 64-bit nao podem ser tratados como equivalentes sem validacao.

## Tasks adicionais

### BED-001 - Confirmar versao Bedrock do mundo

Registrar a versao Bedrock usada para gerar ou validar os pontos.

### BED-002 - Pesquisar algoritmo Bedrock para vilas e cabanas

Levantar fontes e algoritmo para localizacao de `Village` e `Swamp_Hut` em Bedrock.

Fontes locais iniciais:

- `bedrockified/src/main/java/net/earthcomputer/bedrockified/BedrockRandom.java`;
- `bedrockified/src/main/java/net/earthcomputer/bedrockified/BedrockSeed.java`;
- `MCBEStructureFinder/be_random.cpp`;
- `MCBEStructureFinder/be_finder.cpp`;
- `MCBEStructureFinder/structure.h`.

### BED-003 - Criar fixtures Bedrock da seed do mundo

Gerar fixtures da seed `5547459079057001195` para os pontos registrados.

### BED-004 - Implementar primeira engine Bedrock

Criar `BedrockEngine` e implementar as primeiras consultas validaveis contra os pontos reais.

Primeiro alvo: tentativa de `Village` e `Swamp_Hut` sem biome check, retornando `biome_unknown` quando a viabilidade ainda nao puder ser calculada.

### BED-005 - Implementar `getBiomeAt` Bedrock

Adicionar suporte de bioma para os pontos conhecidos e evoluir para areas maiores.

## Risco principal

O maior risco e assumir que algoritmos Java e Bedrock coincidem. O backlog deve tratar qualquer reaproveitamento de Java como hipotese a validar, nao como contrato.

Risco adicional: as referencias Bedrock locais mostram algoritmos historicos com seed 32-bit, enquanto a seed do mundo do workspace tem 64 bits. A versao Bedrock do mundo precisa ser confirmada antes de bloquear testes por esses resultados.
