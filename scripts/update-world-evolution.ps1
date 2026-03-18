param(
    [string]$WorldPath = "world",
    [string]$DocPath = "docs/evolucao-do-mundo.md",
    [string]$Reference = "HEAD"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,
        [switch]$AllowFailure
    )

    $output = & git @Arguments 2>&1
    if ($LASTEXITCODE -ne 0 -and -not $AllowFailure) {
        throw "git $($Arguments -join ' ') failed: $output"
    }

    if ($null -eq $output) {
        return @()
    }

    if ($output -is [System.Array]) {
        return $output
    }

    return (, [string]$output)
}

function Test-GitPathExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$GitPath
    )

    & git cat-file -e "$Reference`:$GitPath" 2>$null
    return $LASTEXITCODE -eq 0
}

function Get-GitBlobSize {
    param(
        [Parameter(Mandatory = $true)]
        [string]$GitPath
    )

    if (-not (Test-GitPathExists -GitPath $GitPath)) {
        return $null
    }

    $size = & git cat-file -s "$Reference`:$GitPath" 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $null
    }

    return [long]$size
}

function Format-Size {
    param(
        [long]$Bytes
    )

    if ($Bytes -lt 1KB) {
        return "$Bytes B"
    }

    if ($Bytes -lt 1MB) {
        return "{0:N1} KB" -f ($Bytes / 1KB)
    }

    if ($Bytes -lt 1GB) {
        return "{0:N1} MB" -f ($Bytes / 1MB)
    }

    return "{0:N1} GB" -f ($Bytes / 1GB)
}

function Get-StatusLabel {
    param(
        [string]$Code
    )

    switch ($Code) {
        "A" { return "adicionado" }
        "M" { return "modificado" }
        "D" { return "removido" }
        "R" { return "renomeado" }
        "C" { return "copiado" }
        "T" { return "tipo alterado" }
        default { return $Code }
    }
}

$repoRootOutput = Invoke-Git -Arguments @("rev-parse", "--show-toplevel")
$repoRoot = ([string]($repoRootOutput | Select-Object -First 1)).Trim()
if (-not $repoRoot) {
    throw "Nao foi possivel localizar a raiz do repositorio git."
}

Set-Location $repoRoot

$docAbsolutePath = Join-Path $repoRoot $DocPath
$docDirectory = Split-Path -Parent $docAbsolutePath
if ($docDirectory -and -not (Test-Path $docDirectory)) {
    New-Item -ItemType Directory -Path $docDirectory | Out-Null
}

$now = Get-Date
$referenceCommitOutput = Invoke-Git -Arguments @("rev-parse", "--short", $Reference)
$referenceCommit = ([string]($referenceCommitOutput | Select-Object -First 1)).Trim()
$trackedWorldPaths = Invoke-Git -Arguments @("ls-tree", "-r", "--name-only", $Reference, "--", $WorldPath) -AllowFailure
$trackedWorldPaths = @($trackedWorldPaths | Where-Object { $_ -and $_.Trim() })
$changedLines = Invoke-Git -Arguments @("diff", "--name-status", $Reference, "--", $WorldPath) -AllowFailure
$changedLines = @($changedLines | Where-Object { $_ -and $_.Trim() })
$worldIgnored = Invoke-Git -Arguments @("check-ignore", $WorldPath) -AllowFailure
$worldIgnored = @($worldIgnored | Where-Object { $_ -and $_.Trim() })

$report = New-Object System.Collections.Generic.List[string]
$report.Add("# Evolucao do Mundo")
$report.Add("")
$report.Add("- Gerado em: $($now.ToString("yyyy-MM-dd HH:mm:ss zzz"))")
$report.Add(("- Referencia de comparacao: {0} ({1})" -f $Reference, $referenceCommit))
$report.Add(("- Pasta analisada: {0}" -f $WorldPath))
$report.Add("")

if ($trackedWorldPaths.Count -eq 0) {
    $report.Add("## Status")
    $report.Add("")
    $report.Add(("Nao ha arquivos de {0} versionados em {1}." -f $WorldPath, $Reference))
    $report.Add("")

    if ($worldIgnored.Count -gt 0) {
        $report.Add("A pasta esta ignorada pelo git no momento. Enquanto isso continuar, nao existe base versionada para comparar a evolucao do save desde o ultimo commit.")
        $report.Add("")
        $report.Add("## Como habilitar esse fluxo")
        $report.Add("")
        $report.Add("- Remova ou ajuste a regra world/ no .gitignore.")
        $report.Add("- Adicione snapshots do save ao git, de preferencia em commits pequenos e frequentes.")
        $report.Add("- Rode este script apos alterar world/ para atualizar o documento automaticamente.")
    }
    else {
        $report.Add("A pasta nao esta ignorada, mas tambem nao foi adicionada ao historico ainda. Adicione pelo menos um commit com o conteudo de world/ para destravar a comparacao.")
    }

    Set-Content -Path $docAbsolutePath -Value ($report -join "`r`n") -Encoding UTF8
    Write-Output "Documento atualizado em $docAbsolutePath"
    return
}

$entries = New-Object System.Collections.Generic.List[object]
foreach ($line in $changedLines) {
    $parts = $line -split "`t"
    if ($parts.Count -lt 2) {
        continue
    }

    $statusCode = $parts[0]
    $path = $parts[-1]
    $currentPath = Join-Path $repoRoot $path
    $currentExists = Test-Path $currentPath
    $currentSize = $null
    $currentModified = $null

    if ($currentExists) {
        $item = Get-Item $currentPath
        $currentSize = [long]$item.Length
        $currentModified = $item.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    }

    $previousSize = Get-GitBlobSize -GitPath $path
    $entries.Add([pscustomobject]@{
        StatusCode      = $statusCode
        StatusLabel     = Get-StatusLabel -Code $statusCode
        Path            = $path
        CurrentExists   = $currentExists
        CurrentModified = $currentModified
        CurrentSize     = $currentSize
        PreviousSize    = $previousSize
    })
}

$dbChanges = @($entries | Where-Object { $_.Path -like "$WorldPath/db/*" })
$metadataChanges = @($entries | Where-Object { $_.Path -in @("$WorldPath/level.dat", "$WorldPath/level.dat_old") })
$nameChanges = @($entries | Where-Object { $_.Path -eq "$WorldPath/levelname.txt" })
$packChanges = @($entries | Where-Object { $_.Path -in @("$WorldPath/world_behavior_packs.json", "$WorldPath/world_resource_packs.json") })

$report.Add("## Status")
$report.Add("")
$report.Add("- Arquivos alterados desde o ultimo commit: $($entries.Count)")
$report.Add(("- Alteracoes no banco db/: {0}" -f $dbChanges.Count))
$report.Add("- Alteracoes em metadados do mundo: $($metadataChanges.Count)")
$report.Add("")

$report.Add("## Leitura automatica")
$report.Add("")
if ($entries.Count -eq 0) {
    $report.Add("Nenhuma alteracao detectada em world/ desde o ultimo commit.")
}
else {
    if ($metadataChanges.Count -gt 0) {
        $report.Add("- level.dat ou level.dat_old mudou: o mundo foi salvo novamente e metadados globais foram atualizados.")
    }
    if ($dbChanges.Count -gt 0) {
        $report.Add("- Arquivos de world/db/ mudaram: houve progresso persistido no save, normalmente associado a exploracao, construcao, movimentacao de jogador, entidades, inventario e estado dos chunks.")
    }
    if ($nameChanges.Count -gt 0) {
        $report.Add("- levelname.txt mudou: o nome exibido do mundo foi alterado.")
    }
    if ($packChanges.Count -gt 0) {
        $report.Add("- Arquivos de behavior/resource packs mudaram: a configuracao de packs do mundo foi alterada.")
    }
    if ($entries.Count -gt 0 -and $metadataChanges.Count -eq 0 -and $dbChanges.Count -eq 0 -and $nameChanges.Count -eq 0 -and $packChanges.Count -eq 0) {
        $report.Add("- Houve alteracoes em world/, mas fora dos arquivos mais comuns de progresso. Veja a tabela detalhada abaixo.")
    }
}

$report.Add("")
$report.Add("## Limitacoes da inferencia")
$report.Add("")
$report.Add("- So com git diff em world/ nao e possivel afirmar com precisao quais biomas, estruturas ou posicoes de jogador mudaram.")
$report.Add("- Para relatos mais ricos, combine este script com snapshots renderizados em output/ ou com um parser do save Bedrock.")
$report.Add("")

$report.Add("## Arquivos alterados")
$report.Add("")
$report.Add("| Status | Caminho | Ultima modificacao local | Tamanho atual | Tamanho no commit |")
$report.Add("| --- | --- | --- | ---: | ---: |")

if ($entries.Count -eq 0) {
    $report.Add("| sem mudancas | - | - | - | - |")
}
else {
    foreach ($entry in $entries) {
        $currentSizeText = if ($null -ne $entry.CurrentSize) { Format-Size -Bytes $entry.CurrentSize } else { "-" }
        $previousSizeText = if ($null -ne $entry.PreviousSize) { Format-Size -Bytes $entry.PreviousSize } else { "-" }
        $currentModifiedText = if ($entry.CurrentModified) { $entry.CurrentModified } else { "-" }
        $report.Add(("| {0} | {1} | {2} | {3} | {4} |" -f $entry.StatusLabel, $entry.Path, $currentModifiedText, $currentSizeText, $previousSizeText))
    }
}

Set-Content -Path $docAbsolutePath -Value ($report -join "`r`n") -Encoding UTF8
Write-Output "Documento atualizado em $docAbsolutePath"
