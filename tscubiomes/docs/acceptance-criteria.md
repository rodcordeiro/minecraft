# Criterios de aceite - tscubiomes

## Criterios globais

- A biblioteca deve ser escrita em TypeScript.
- Runtime nao deve depender de binarios C.
- O uso de `cubiomes` C e permitido apenas para gerar fixtures e validar paridade.
- O produto final deve suportar interpretacao de seeds Minecraft Bedrock.
- APIs de seed, bioma e estrutura devem exigir ou inferir explicitamente `edition`; nao pode haver default silencioso para Java em fluxos Bedrock.
- Seeds devem aceitar string e `bigint`; `number` so pode ser aceito quando seguro.
- Funcoes publicas devem retornar erro tipado para versao, dimensao ou estrutura nao suportada.
- Testes devem cobrir coordenadas negativas e positivas.
- A seed `5547459079057001195` deve existir como fixture de produto.

## Criterios por marco

### Marco 0

- Scaffold compila, testa e gera build.
- Helpers numericos preservam a seed `5547459079057001195` sem perda.
- Java Random possui fixtures.
- BedrockRandom/MT19937 possui fixtures.
- Politica de seed Bedrock diferencia modo 32-bit legado e seed 64-bit sem truncamento silencioso.
- Fixture inicial registra vilas e cabana de bruxa.
- Fixture inicial registra `edition: "bedrock"`.

### Marco 1

- `StructureType.Village` e `StructureType.Swamp_Hut` existem.
- `getStructureConfig` retorna configuracoes por edicao, sem reutilizar config Java em chamada Bedrock.
- `getStructurePos` calcula tentativas Bedrock por regiao para `Village` e `Swamp_Hut`.
- `scanStructureAttempts` encontra candidatos proximos aos pontos reais, respeitando tolerancia.
- `isSlimeChunk` esta implementado e testado.
- Estruturas Bedrock sem validacao ficam bloqueadas ou experimentais, nunca suportadas silenciosamente.

### Marco 2

- Helpers de bioma suportam os nomes usados nos pontos reais.
- API distingue tentativa de estrutura de viabilidade por bioma.
- Quando a viabilidade nao puder ser calculada, o retorno deve ser `unknown`, nao `false`.

### Marco 2B

- Existe contrato interno de engine por edicao.
- Existe `BedrockEngine`, mesmo que incremental.
- Seed Bedrock `5547459079057001195` e aceita sem perda de precisao.
- Pontos reais do mundo Bedrock sao usados como validacao obrigatoria do marco.
- Funcionalidades Bedrock pendentes retornam status/erro explicito, nao resultado Java.
- Qualquer dependencia de semantica 32-bit/64-bit da seed fica registrada no resultado.

### Marco 3

- `getBiomeAt` funciona para pelo menos uma versao pre-1.18 escolhida.
- Hashes de referencia do `cubiomes/tests.c` passam para as versoes implementadas.
- Escalas suportadas ficam documentadas.

### Marco 4

- Xoroshiro128 passa em fixtures.
- Noise base passa em fixtures.
- `getBiomeAt` moderno roda para a seed `5547459079057001195`.
- Divergencias com os pontos reais sao documentadas com hipotese tecnica.
- `getBiomeAt` Bedrock para a versao alvo e planejado ou implementado conforme escopo fechado do marco.

### Marco 5

- API publica funcional documentada.
- CLI JSON documentada.
- Plano de integracao com `mine_mcp` criado sem acoplamento prematuro.

## Tolerancias de validacao por ponto

As estruturas do Minecraft podem ter diferenca entre coordenada registrada pelo usuario, coordenada de tentativa, inicio da estrutura, bounding box e ponto visual no mapa. Por isso a validacao inicial deve usar tolerancias explicitas.

| Ponto | Tipo | X | Z | Tolerancia inicial |
| --- | --- | ---: | ---: | --- |
| Alvorada Branca | Village | -296 | -296 | ate 96 blocos |
| Ermo da Neve | Village | -360 | 296 | ate 96 blocos |
| Pinhal de Valkaria | Village | 344 | -360 | ate 96 blocos |
| Cabana de bruxa | Swamp_Hut | 7432 | -2840 | ate 32 blocos |

Estas tolerancias se aplicam ao mundo Bedrock do usuario. Para comparacoes Java derivadas de `cubiomes`, usar fixtures separadas e nao misturar os contratos.

## Definicao de pronto de uma task

- Codigo ou documento criado no local previsto.
- Teste automatizado quando a task alterar comportamento.
- Fixture criada ou atualizada quando a task depender de paridade.
- `pnpm run typecheck` e `pnpm run test` executados quando houver scaffold.
- Riscos ou limitacoes registrados no proprio documento ou README.

## Definicao de pronto de um marco

- Todas as tasks obrigatorias do marco concluidas.
- Criterios globais continuam atendidos.
- Resultado validado contra a seed `5547459079057001195` quando o marco envolver estruturas ou biomas.
- Proximo marco revisado com base nas descobertas tecnicas.
