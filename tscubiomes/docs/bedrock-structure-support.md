# Matriz de suporte de estruturas Bedrock

## Estado atual

O Marco 1 implementa apenas tentativa de estrutura, sem biome check. O retorno usa `biome_unknown` para deixar claro que a estrutura candidata ainda nao foi validada por bioma.

As formulas Bedrock avaliadas nas referencias locais usam seed 32-bit. Como a seed real do workspace e `5547459079057001195`, qualquer chamada com essa seed precisa informar `seedPolicy: "legacy-32"` para executar a conversao de forma explicita. Sem essa politica, a API rejeita a chamada como ambigua.

## Estruturas

| Estrutura | Status | Fonte local | Config Bedrock | Observacao |
| --- | --- | --- | --- | --- |
| `Village` | `experimental` | `MCBEStructureFinder/structure.h` | spacing `27`, spawnRange `17`, salt `10387312`, randomValues `4` | Primeiro alvo do MVP; ainda requer fixture Bedrock externa |
| `Swamp_Hut` | `experimental` | `MCBEStructureFinder/structure.h` | spacing `32`, spawnRange `24`, salt `14357617`, randomValues `2` | Usa config random scattered; primeiro alvo junto com `Village` |
| `Desert_Temple` | `blocked` | `MCBEStructureFinder/structure.h` | random scattered | Bloqueado ate fixture externa |
| `Jungle_Temple` | `blocked` | `MCBEStructureFinder/structure.h` | random scattered | Bloqueado ate fixture externa |
| `Igloo` | `blocked` | `MCBEStructureFinder/structure.h` | random scattered | Bloqueado ate fixture externa |
| `Ocean_Monument` | `blocked` | `MCBEStructureFinder/structure.h` | spacing `32`, spawnRange `27`, salt `10387313`, randomValues `4` | Bloqueado ate fixture externa |
| `Woodland_Mansion` | `blocked` | `MCBEStructureFinder/structure.h` | spacing `80`, spawnRange `60`, salt `10387319`, randomValues `4` | Bloqueado ate fixture externa |
| `Buried_Treasure` | `blocked` | `MCBEStructureFinder/structure.h` | spacing `4`, spawnRange `2`, salt `16842397`, randomValues `4` | Bloqueado ate fixture externa |
| `Stronghold` | `blocked` | `bedrockified` | algoritmo proprio | Nao promover sem vetor real |
| `Mineshaft` | `blocked` | `bedrockified`/`MCBEStructureFinder` | algoritmo marcado como incerto | Nao promover sem vetor real |
| `Ocean_Ruin` | `blocked` | `bedrockified`/`MCBEStructureFinder` | algoritmo incompleto nas referencias | Nao promover sem vetor real |
| `Shipwreck` | `blocked` | `bedrockified`/`MCBEStructureFinder` | algoritmo incompleto nas referencias | Nao promover sem vetor real |
| `Ruined_Portal` | `blocked` | `MCBEStructureFinder` | retorno provisorio nas referencias | Nao promover sem vetor real |
| `Nether_Fortress` | `blocked` | `MCBEStructureFinder` | nether structure | Nao promover sem vetor real |
| `Bastion` | `blocked` | `MCBEStructureFinder` | nether structure | Nao promover sem vetor real |
| `End_City` | `blocked` | `MCBEStructureFinder` | algoritmo incompleto nas referencias | Nao promover sem vetor real |

## Proximo criterio para promover suporte

Para mover uma estrutura de `blocked` para `experimental`, precisamos de:

- algoritmo puro documentado;
- fixture de candidato por regiao;
- fixture externa de Bedrock, preferencialmente `/locate`;
- teste com coordenadas positivas e negativas quando aplicavel.

Para mover de `experimental` para `supported`, precisamos tambem de:

- versao Bedrock fixada;
- seed policy confirmada;
- criterio de biome check ou status explicito quando o bioma nao puder ser calculado.
