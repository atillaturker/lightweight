# scripts/migrate-to-legacy.ps1
# Moves legacy code to src/_legacy/ for reference.
# Run from project root.

$ErrorActionPreference = "Stop"
$Root = (Get-Location).Path
$Legacy = Join-Path $Root "src/_legacy"

Write-Host "Creating _legacy folder..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $Legacy -Force | Out-Null

# --- Move the folders that will be replaced ---

$toMove = @(
  "src/screens/app",           # old app screens
  "src/components/ui",         # old UI primitives
  "src/components/workout",    # old workout components
  "src/navigation",            # replaced by src/app/navigation
  "src/store",                 # Redux → Zustand migration
  "src/utils",                 # review later
  "src/data",                  # seed data (review later)
  "src/components",            # review what's left (auth + others)
  "src/theme",                 # replaced by new theme
  "src/types"                  # old workout types
)

foreach ($item in $toMove) {
  $source = Join-Path $Root $item
  if (Test-Path $source) {
    $name = Split-Path $item -Leaf
    $dest = Join-Path $Legacy $name

    # If dest already exists (like components moved twice), merge
    if (Test-Path $dest) {
      Write-Host "  Merging $item into existing $dest" -ForegroundColor Yellow
      Get-ChildItem -Path $source -Recurse | ForEach-Object {
        $rel = $_.FullName.Substring($source.Length + 1)
        $target = Join-Path $dest $rel
        if ($_.PSIsContainer) {
          New-Item -ItemType Directory -Path $target -Force | Out-Null
        } else {
          $targetDir = Split-Path $target -Parent
          New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
          Move-Item -Path $_.FullName -Destination $target -Force
        }
      }
    } else {
      Write-Host "  Moving $item -> _legacy/$name" -ForegroundColor Green
      Move-Item -Path $source -Destination $dest
    }
  } else {
    Write-Host "  Skipping (not found): $item" -ForegroundColor DarkGray
  }
}

# --- Recreate empty new folders for the fresh start ---

$newDirs = @(
  "src/theme",
  "src/types",
  "src/lib",
  "src/app/navigation",
  "src/app/providers",
  "src/components/Button",
  "src/components/Input",
  "src/components/Badge",
  "src/components/Toggle",
  "src/components/SegmentedControl",
  "src/components/TextTabs",
  "src/components/ScreenHeader",
  "src/components/TabBar",
  "src/components/SectionHeader",
  "src/components/SettingsRow",
  "src/components/Radio",
  "src/components/Pill",
  "src/components/EmptyState"
)

foreach ($d in $newDirs) {
  $full = Join-Path $Root $d
  if (-not (Test-Path $full)) {
    New-Item -ItemType Directory -Path $full -Force | Out-Null
    New-Item -ItemType File -Path (Join-Path $full ".gitkeep") -Force | Out-Null
  }
}

Write-Host ""
Write-Host "Migration complete." -ForegroundColor Green
Write-Host ""
Write-Host "What stayed in place:"
Write-Host "  src/services/firebase/   (working auth backend)"
Write-Host "  src/schemas/             (auth validation)"
Write-Host "  src/hooks/               (useAuthActions)"
Write-Host "  src/screens/auth/        (auth UI, still working)"
Write-Host ""
Write-Host "Moved to _legacy/ for reference:"
Write-Host "  app screens, ui/, workout/, navigation/, store/,"
Write-Host "  utils/, data/, theme/, types/"
Write-Host ""
Write-Host "Next: run `tree /F /A src | more` to review."