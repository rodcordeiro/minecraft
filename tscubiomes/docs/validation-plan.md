# Plano de validacao - tscubiomes

## Seed baseline

Seed do mundo:

```text
5547459079057001195
```

Representacao recomendada em fixtures:

```json
{
  "seed": "5547459079057001195",
  "edition": "bedrock",
  "version": "to-be-confirmed"
}
```

## Pontos de comparativo

Os pontos abaixo vieram de `mine_mcp/data/points.json` e serao usados como validacao funcional de produto.

```json
{
  "seed": "5547459079057001195",
  "points": [
    {
      "name": "Alvorada Branca",
      "type": "village",
      "x": -296,
      "z": -296,
      "dimension": "overworld",
      "expectedBiomeHint": "snowy_plains"
    },
    {
      "name": "Ermo da Neve",
      "type": "village",
      "x": -360,
      "z": 296,
      "dimension": "overworld",
      "expectedBiomeHint": "snowy_plains"
    },
    {
      "name": "Pinhal de Valkaria",
      "type": "village",
      "x": 344,
      "z": -360,
      "dimension": "overworld",
      "expectedBiomeHint": "snowy_taiga"
    },
    {
      "name": "Cabana de bruxa",
      "type": "witch_hut",
      "structureType": "Swamp_Hut",
      "x": 7432,
      "z": -2840,
      "dimension": "overworld",
      "expectedBiomeHint": "swamp"
    }
  ]
}
```

## Estrategia de validacao

O plano deve separar validacao Java e Bedrock. `cubiomes` ajuda a validar Java, mas o aceite de produto depende de Bedrock.

### Nivel 1 - Paridade matematica

Objetivo: validar helpers numericos e RNG.

Entrada:

- seeds fixas;
- coordenadas positivas e negativas;
- valores proximos de overflow.

Saida esperada:

- fixtures geradas por programa auxiliar, saidas conhecidas do `cubiomes` para Java, ou fontes Bedrock definidas no marco de pesquisa.

### Nivel 2 - Tentativa de estrutura

Objetivo: validar que `getStructurePos` e `scanStructureAttempts` encontram candidatos nas regioes corretas.

Entrada:

- seed Bedrock `5547459079057001195`;
- `Village`;
- `Swamp_Hut`;
- areas em torno dos pontos registrados.

Saida esperada:

- candidato de vila proximo a cada vila registrada;
- candidato de cabana de bruxa proximo ao ponto registrado;
- retorno com coordenada de regiao, chunk e bloco.
- resultado deve indicar `edition: "bedrock"` quando validar o mundo do usuario.

### Nivel 3 - Viabilidade por bioma

Objetivo: validar se a tentativa de estrutura e viavel pelo bioma.

Entrada:

- seed Bedrock `5547459079057001195`;
- pontos registrados;
- versao Minecraft confirmada.

Saida esperada:

- `Village` viavel para as vilas registradas;
- `Swamp_Hut` viavel para a cabana de bruxa;
- quando o gerador de bioma ainda nao existir, retorno `biome_unknown`.

### Nivel 4 - Bioma no ponto

Objetivo: validar `getBiomeAt` contra os biomas esperados dos pontos.

Entrada:

- `Alvorada Branca`: `x=-296`, `z=-296`;
- `Ermo da Neve`: `x=-360`, `z=296`;
- `Pinhal de Valkaria`: `x=344`, `z=-360`;
- `Cabana de bruxa`: `x=7432`, `z=-2840`.

Saida esperada:

- vilas retornam biomas frios compativeis com os hints registrados;
- cabana retorna bioma compativel com swamp.

## Tarefas de fixture

### FIX-001 - Criar fixture manual inicial

- Criar `fixtures/seed-5547459079057001195.points.json`.
- Registrar os pontos do `mine_mcp`.
- Marcar `version` como `to-be-confirmed`.

### FIX-002 - Criar fixture de estrutura via cubiomes

- Criar pequeno programa ou script que consulta `getStructurePos` no `cubiomes`.
- Gerar fixture com tentativas de `Village` e `Swamp_Hut` nas regioes dos pontos.
- Registrar versao Minecraft usada.
- Marcar fixture como Java/comparativa, nao como aceite Bedrock.

### FIX-003 - Criar fixture de bioma via cubiomes

- Consultar `getBiomeAt` nos pontos registrados.
- Registrar escala, Y usado e versao Minecraft.
- Usar fixture como contrato para o port TypeScript.

### FIX-004 - Criar fixture Bedrock

- Confirmar versao Bedrock do mundo.
- Gerar/registrar resultados Bedrock para vilas e cabana da seed `5547459079057001195`.
- Registrar explicitamente se a ferramenta/fonte usa seed 32-bit ou 64-bit.
- Priorizar fixture de tentativa de estrutura gerada a partir de `BedrockRandom`/MT19937 e configs do `MCBEStructureFinder`, validada contra ferramenta externa ou observacao do mundo.
- Separar fixture Bedrock de qualquer fixture Java.
- Usar esta fixture como contrato de aceite do produto.

### FIX-005 - Coletar vetores Bedrock por `/locate`

- Registrar seed, versao Bedrock, comando usado e estrutura localizada.
- Coletar pelo menos `Village` e `Swamp_Hut` para o mundo do usuario.
- Quando possivel, coletar tambem `DesertTemple`, `JungleTemple`, `Igloo`, `OceanMonument`, `WoodlandMansion` e `BuriedTreasure`.
- Nao promover `Stronghold`, `Mineshaft`, `OceanRuin`, `Shipwreck`, `RuinedPortal`, `NetherFortress`, `Bastion` ou `Endcity` para suportado sem vetor especifico.

## Observacoes

- O workspace atual e Bedrock. Para o `tscubiomes`, a referencia operacional final deve ser Bedrock.
- Os pontos foram informados como identificados a partir do `cubiomes`, mas isso deve ser tratado com cautela porque `cubiomes` mira Java Edition. Eles continuam sendo pontos de produto, mas precisam de fixture Bedrock propria.
- A versao exata do Minecraft Bedrock usada na identificacao dos pontos precisa ser fixada antes de transformar os resultados em testes obrigatorios.
- Ate confirmar a versao, os pontos devem ser usados como validacao exploratoria e nao como bloqueio absoluto de build.
