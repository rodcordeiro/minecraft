# Project Charter - tscubiomes

## Objetivo

Criar o `tscubiomes`, uma biblioteca TypeScript para consultar dados de geracao de Minecraft a partir de seed, edicao, versao, dimensao e coordenadas.

O projeto deve priorizar TypeScript puro. Codigo C do `cubiomes` pode ser usado como referencia e fonte de fixtures para Java Edition, mas nao deve ser dependencia de runtime da biblioteca.

Requisito central: ao final do projeto, a biblioteca deve ser capaz de interpretar seeds Minecraft Bedrock. O mundo real usado como baseline neste workspace e Bedrock.

## Escopo inicial

- Recriar em TypeScript os algoritmos necessarios para resultados deterministicos.
- Modelar explicitamente `edition: "java" | "bedrock"` em APIs, fixtures e testes.
- Separar engines de geracao Java e Bedrock para evitar falsas compatibilidades.
- Comecar por funcoes de menor superficie e maior valor pratico para Bedrock:
  - politica numerica com `bigint`;
  - normalizacao de seed Bedrock por versao;
  - BedrockRandom/MT19937;
  - posicoes candidatas de estruturas Bedrock;
  - slime chunks;
  - validacao por pontos reais do mundo do usuario.
- Usar a seed Bedrock `5547459079057001195` como baseline de validacao funcional.
- Usar pontos registrados no `mine_mcp` como comparativos de produto:
  - `Alvorada Branca`: village em `x=-296`, `z=-296`;
  - `Ermo da Neve`: village em `x=-360`, `z=296`;
  - `Pinhal de Valkaria`: village em `x=344`, `z=-360`;
  - `Cabana de bruxa`: witch hut em `x=7432`, `z=-2840`.

## Fora de escopo inicial

- Geracao block-level do mundo.
- Renderizador de mapa.
- Busca massiva de seeds em performance equivalente ao C.
- Integracao direta com `mine_mcp` antes de estabilizar a API minima.
- Port completo de `getBiomeAt` moderno no primeiro marco.

## Premissas

- O alvo funcional e de produto e Minecraft Bedrock Edition.
- Java Edition existe como trilha tecnica secundaria para paridade e comparacao por causa do `cubiomes`.
- As referencias Bedrock locais cobrem principalmente mecanicas antigas; a semantica da seed Bedrock 64-bit do mundo precisa ser confirmada por versao antes de virar contrato bloqueante.
- Seeds e estados internos devem usar `bigint` quando excederem seguranca de `number`.
- Testes de paridade devem validar comportamento em coordenadas positivas e negativas.
- A biblioteca deve falhar explicitamente quando uma versao, dimensao ou estrutura ainda nao estiver suportada.

## Riscos

- Divergencia numerica por overflow, shifts, mascara 48-bit e conversao assinado/nao assinado.
- Ambiguidade de versao Minecraft usada para gerar os pontos atuais.
- Pontos identificados via cubiomes podem representar tentativa de estrutura ou estrutura viavel, dependendo do criterio usado.
- Algoritmos Bedrock nao sao cobertos pelo `cubiomes` original; devem vir de `bedrockified`, `bedrock-cubiomes`, `MCBEStructureFinder` ou validacao propria.
- `MCBEStructureFinder` precisa de confirmacao de licenca antes de qualquer port literal de codigo.
- Referencias antigas usam seed Bedrock 32-bit; isso pode divergir de mundos Bedrock modernos com seed 64-bit.
- Performance de TypeScript puro pode ser insuficiente para scans grandes, mesmo que seja adequada para consultas pontuais.

## Definicao de pronto do projeto

O projeto pode ser considerado iniciado quando:

- existir scaffold TypeScript compilavel;
- houver suite de testes automatizados;
- houver fixtures versionadas para a seed `5547459079057001195`;
- houver modelagem explicita de edicao Java/Bedrock;
- as primeiras funcoes publicas estiverem documentadas;
- o comportamento de erro para escopo nao suportado estiver definido.
