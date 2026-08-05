# Compasso — video -> sequencia de frames WebP pro heroi
# Uso:  .\scripts\frames.ps1 -Video caminho\do\video.mp4 -Name hero
#
# Gera:
#   public/assets/frames/<Name>/desktop/frame_0001.webp ... (fps cheio, 1600px)
#   public/assets/frames/<Name>/mobile/frame_0001.webp  ... (fps reduzido, 900px)
#
# Tecnica da pesquisa: PNG intermediario nao e necessario — o ffmpeg
# escala e converte pra WebP (qualidade 80) em um passo.

param(
  [Parameter(Mandatory = $true)][string]$Video,
  [string]$Name = 'hero',
  [int]$FpsDesktop = 30,
  [int]$FpsMobile = 18,
  [int]$WidthDesktop = 1600,
  [int]$WidthMobile = 900,
  [int]$Quality = 80
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$outBase = Join-Path $root "public\assets\frames\$Name"

foreach ($variant in @(
    @{ dir = 'desktop'; fps = $FpsDesktop; w = $WidthDesktop },
    @{ dir = 'mobile'; fps = $FpsMobile; w = $WidthMobile }
  )) {
  $out = Join-Path $outBase $variant.dir
  if (Test-Path $out) { Remove-Item -Recurse -Force $out }
  New-Item -ItemType Directory -Force $out | Out-Null

  & ffmpeg -y -i $Video `
    -vf "fps=$($variant.fps),scale=$($variant.w):-2:flags=lanczos" `
    -c:v libwebp -quality $Quality -compression_level 6 `
    "$out\frame_%04d.webp"

  $count = (Get-ChildItem $out -Filter '*.webp').Count
  $size = [math]::Round(((Get-ChildItem $out | Measure-Object Length -Sum).Sum / 1MB), 2)
  Write-Host "[$($variant.dir)] $count frames, $size MB -> $out"
}

Write-Host "`nPronto. Atualize o frameCount em quem consome a sequencia '$Name'."
