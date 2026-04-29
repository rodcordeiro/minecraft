# Avaliacao das referencias - tscubiomes

## Decisao tecnica

O `tscubiomes` deve ser planejado como biblioteca Bedrock-first. `cubiomes` continua sendo a melhor referencia de arquitetura, tipos, fixtures Java e ergonomia de API, mas nao deve definir a ordem principal de implementacao do produto.

Para o primeiro MVP util no mundo atual, a trilha critica e:

1. normalizacao de seed Bedrock;
2. RNG Bedrock baseado em MT19937;
3. configuracao Bedrock de estruturas;
4. posicao candidata de estruturas por regiao;
5. scan ao redor dos pontos reais;
6. biome check Bedrock quando a engine de biomas estiver disponivel.

## Referencias avaliadas

### `cubiomes`

Uso recomendado:

- referencia de API para `Generator`, `Range`, `StructureConfig`, `getStructurePos`, `scan` e `getBiomeAt`;
- fonte de fixtures Java separadas;
- referencia de cuidados numericos: overflow, mascara 48-bit e coordenadas negativas;
- base para modelar erros quando versao, dimensao ou estrutura nao estiver suportada.

Limite:

- implementa Minecraft Java Edition;
- nao pode validar por si so a seed Bedrock do workspace;
- algoritmos de estrutura Java nao devem ser usados como fallback para `edition: "bedrock"`.

### `bedrock-cubiomes`

Uso recomendado:

- referencia para geracao por layers e biomas Bedrock antigos;
- fonte intermediaria para entender divergencias entre cubiomes Java e Bedrock;
- apoio para fixture de biomas quando a versao alvo for compativel.

Limite:

- parece baseado no modelo antigo de layers;
- nao substitui uma validacao Bedrock moderna para versoes atuais do mundo.

### `bedrockified`

Uso recomendado:

- referencia principal para conceitos Bedrock em Java: `BedrockRandom`, `BedrockSeed`, layers oceanicas, spawn, strongholds e patches de estruturas;
- `BedrockRandom` mostra MT19937 32-bit, `nextInt(bound)` por modulo e conversao para float/double baseada em unsigned 32-bit;
- `BedrockSeed` documenta normalizacao legada para inteiro 32-bit sem sinal e hash de string;
- patches de estrutura mostram onde Bedrock diverge das formulas Java.

Limite:

- alvo historico declarado: Minecraft 1.13.1;
- nao deve ser assumido como contrato moderno sem fixtures da versao Bedrock do mundo;
- algumas classes dependem de contexto de Minecraft Java modificado, entao precisam ser traduzidas para regras puras.

### `MCBEStructureFinder`

Uso recomendado:

- referencia mais direta para estruturas Bedrock;
- define `BEStructureConfig` com `spacing`, `spawnRange`, `salt` e `num`;
- fornece configs relevantes para o MVP:
  - `BE_VILLAGE = { spacing: 27, spawnRange: 17, salt: 10387312, num: 4 }`;
  - `BE_RANDOM_SCATTERED = { spacing: 32, spawnRange: 24, salt: 14357617, num: 2 }`, aplicavel a witch hut, jungle temple e desert temple;
- calcula seed de area como `salt - 245998635 * regionZ - 1724254968 * regionX`, depois soma a world seed Bedrock;
- gera offsets com MT19937:
  - `num = 2`: usa dois valores modulo `spawnRange`;
  - `num = 4`: usa media de dois valores para X e dois para Z;
- registra filtros de bioma para `Village` e `Witch_Hut`.
- lista estruturas Bedrock candidatas, mas com graus diferentes de confianca.

Estruturas com melhor evidencia para backlog inicial:

- `Village`;
- `Witch_Hut`, via `BE_RANDOM_SCATTERED`;
- `DesertTemple`, via `BE_RANDOM_SCATTERED`;
- `JungleTemple`, via `BE_RANDOM_SCATTERED`;
- `Igloo`, via `BE_RANDOM_SCATTERED`;
- `OceanMonument`;
- `WoodlandMansion`;
- `BuriedTreasure`.

Estruturas que devem ficar bloqueadas ate fixture externa:

- `Stronghold`;
- `Mineshaft`;
- `OceanRuin`;
- `Shipwreck`;
- `RuinedPortal`;
- `NetherFortress`/`Bastion`;
- `Endcity`.

Limite:

- a licenca nao esta explicita nos arquivos principais avaliados; tratar como referencia tecnica ate confirmar a origem/licenca antes de copiar codigo;
- ha comentarios e trechos marcados como `error`/`todo`;
- depende de uma copia de cubiomes/bedrock-cubiomes para biome checks;
- precisa de fixtures externas para confirmar compatibilidade com a versao Bedrock atual.

## Implicacoes para o backlog

- `BedrockRandom` deve entrar no Marco 0, ao lado de helpers numericos.
- `JavaRandom` passa a ser suporte de paridade Java, nao bloqueador do MVP Bedrock.
- `StructureConfig` precisa ter variantes por edicao; as configs Bedrock nao sao as mesmas do Java.
- O Marco 1 deve calcular estruturas Bedrock sem biome check antes de expandir Java.
- `Village` e `Swamp_Hut` devem ser os primeiros tipos, porque cobrem os pontos reais do workspace.
- Estruturas com retorno provisorio, `todo` ou algoritmo incompleto nao devem entrar na API publica como suportadas.
- A API deve expor o status do resultado: `attempt`, `biome_unknown`, `biome_viable`, `unsupported` ou equivalente.
- Seeds Bedrock precisam registrar a semantica por versao. As referencias locais mostram seed Bedrock legada 32-bit, mas a seed do workspace tem 64 bits; isso deve ser validado antes de transformar fixtures em contrato bloqueante.

## Riscos

- Versao Bedrock nao confirmada: sem ela, qualquer fixture de estrutura/bioma pode virar falso negativo.
- Seed Bedrock 64-bit: as referencias antigas usam 32-bit; o mundo atual usa `5547459079057001195`, entao a politica de seed precisa ser versionada.
- Biome check incompleto: a primeira entrega deve aceitar tentativa de estrutura com `biome_unknown`, nao simular certeza.
- Licenca do MCBEStructureFinder: antes de portar literalmente trechos de codigo, confirmar licenca ou reimplementar por especificacao/observacao.
- Coordenadas negativas: formulas de divisao por regiao/chunk precisam reproduzir floor division, nao truncamento JavaScript.
