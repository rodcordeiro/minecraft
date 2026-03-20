# mine_mcp

Servidor MCP do workspace de Minecraft para:

- registrar pontos de mapa e receitas;
- consultar distancias e pontos proximos;
- integrar com o exaroton para inspecionar arquivos e baixar mundos para o workspace local.

## Escopo

O servidor expoe tools de apoio operacional para este workspace em `C:\Users\rodrigo.cordeiro\projetos\personal\minecraft`.

Capacidades atuais:

- contexto do workspace (`world`, `output`, `downloads`, `data`);
- pontos persistidos em JSON;
- receitas e guias persistidos em JSON;
- leitura basica de conta e servidor no exaroton;
- inspecao de arquivos remotos no exaroton;
- download de arquivos e diretorios do exaroton;
- download de mundos do exaroton para o workspace local.

## Requisitos

- Node.js 20+;
- `pnpm`;
- dependencias instaladas em `mine_mcp/node_modules`.

Para as tools do exaroton:

- `EXAROTON_API_TOKEN` obrigatorio;
- `EXAROTON_SERVER_ID` opcional, mas recomendado quando um servidor e usado com frequencia.

## Estrutura

- `src/index.ts`: registro do servidor MCP, resources e tools.
- `src/services/exaroton-service.ts`: acesso REST ao exaroton e logica de download.
- `src/services/map-service.ts`: regras de pontos e distancias.
- `src/services/recipe-service.ts`: regras de receitas.
- `data/points.json`: armazenamento dos pontos.
- `data/recipes.json`: armazenamento das receitas.

## Scripts

- `pnpm run dev`: executa o servidor a partir do TypeScript via `tsx`.
- `pnpm run typecheck`: valida tipos sem gerar build.
- `pnpm run test`: executa a suite de testes.
- `pnpm run build`: gera `dist/`.

## Resources MCP

- `mine-mcp://workspace/context`
  Retorna caminhos relevantes do workspace, incluindo `world`, `output` e `downloads`.

- `mine-mcp://integrations/exaroton`
  Retorna o estado de configuracao da integracao do exaroton e as capacidades habilitadas no codigo.

## Tools MCP

### Mapa e receitas

- `register_point`
- `list_points`
- `distance_to_point`
- `nearest_point_by_type`
- `register_recipe`
- `list_recipes`
- `get_recipe`

### exaroton

- `exaroton_get_account`
  Retorna os dados da conta autenticada.

- `exaroton_list_servers`
  Lista os servidores visiveis para o token configurado.

- `exaroton_get_server`
  Retorna o overview do servidor, com status nomeado e RAM configurada quando disponivel.

- `exaroton_get_server_ram`
  Retorna a RAM configurada do servidor.

- `exaroton_get_file_info`
  Consulta metadados de um arquivo ou diretorio remoto.

- `exaroton_get_text_file`
  Le um arquivo texto remoto como UTF-8.

- `exaroton_download_file`
  Baixa um arquivo remoto para dentro do workspace local.

- `exaroton_download_directory`
  Baixa recursivamente um diretorio remoto para dentro do workspace local.

- `exaroton_download_world`
  Atalho para baixar um mundo remoto, como `world`, `world_nether` ou `world_the_end`.

## Regras operacionais

- Downloads do exaroton sao limitados ao workspace deste projeto.
- O destino padrao dos downloads fica em `downloads/exaroton/`.
- O servidor rejeita caminhos que tentem escapar do workspace com `..`.
- A integracao atual usa a API REST do exaroton; streaming em websocket ainda nao faz parte do servidor.

## Exemplos de uso

Consultar metadados do diretorio principal do mundo:

```json
{
  "tool": "exaroton_get_file_info",
  "arguments": {
    "filePath": "world"
  }
}
```

Baixar um arquivo especifico:

```json
{
  "tool": "exaroton_download_file",
  "arguments": {
    "filePath": "world/level.dat",
    "destinationPath": "downloads/exaroton/world/level.dat"
  }
}
```

Baixar o mundo principal:

```json
{
  "tool": "exaroton_download_world",
  "arguments": {
    "worldPath": "world",
    "destinationDir": "downloads/exaroton/world"
  }
}
```

## Desenvolvimento

Fluxo recomendado ao evoluir o servidor:

1. alterar o codigo em `src/`;
2. rodar `pnpm run typecheck`;
3. rodar `pnpm run test`;
4. rodar `pnpm run build`;
5. reiniciar a sessao/cliente MCP que consome o `dist/index.js`.

## Versao atual

`0.2.0`

Motivacao desta versao:

- o projeto deixou de ser apenas um MCP de pontos/receitas;
- agora inclui integracao pratica com exaroton para leitura de arquivos e download de mundos;
- houve ampliacao relevante de escopo sem quebra deliberada da interface ja existente.
