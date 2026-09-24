# scripts/init-structure.ps1
# Kinetic — project skeleton initializer
# Run from project root:  .\scripts\init-structure.ps1

$ErrorActionPreference = "Stop"

$Root = (Get-Location).Path
$Src  = Join-Path $Root "src"

Write-Host "Creating directory structure..." -ForegroundColor Cyan

# ─── app ────────────────────────────────────────────────
$dirs = @(
  "src/app/navigation",
  "src/app/providers",

  "src/theme",

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
  "src/components/EmptyState",

  "src/domain/entities/__tests__",
  "src/domain/value-objects/__tests__",
  "src/domain/rules/__tests__",

  "src/features/auth/screens",
  "src/features/auth/components",
  "src/features/auth/hooks",
  "src/features/auth/services",
  "src/features/auth/store",
  "src/features/auth/utils",
  "src/features/auth/__tests__",

  "src/features/onboarding/screens",
  "src/features/onboarding/components",
  "src/features/onboarding/hooks",
  "src/features/onboarding/services",
  "src/features/onboarding/store",
  "src/features/onboarding/utils",
  "src/features/onboarding/__tests__",

  "src/features/workout/screens",
  "src/features/workout/components",
  "src/features/workout/hooks",
  "src/features/workout/services",
  "src/features/workout/store",
  "src/features/workout/utils",
  "src/features/workout/__tests__",

  "src/features/routines/screens",
  "src/features/routines/components",
  "src/features/routines/hooks",
  "src/features/routines/services",
  "src/features/routines/store",
  "src/features/routines/utils",
  "src/features/routines/__tests__",

  "src/features/analytics/screens",
  "src/features/analytics/components",
  "src/features/analytics/hooks",
  "src/features/analytics/services",
  "src/features/analytics/store",
  "src/features/analytics/utils",
  "src/features/analytics/__tests__",

  "src/features/history/screens",
  "src/features/history/components",
  "src/features/history/hooks",
  "src/features/history/services",
  "src/features/history/store",
  "src/features/history/utils",
  "src/features/history/__tests__",

  "src/features/profile/screens",
  "src/features/profile/components",
  "src/features/profile/hooks",
  "src/features/profile/services",
  "src/features/profile/store",
  "src/features/profile/utils",
  "src/features/profile/__tests__",

  "src/infrastructure/storage",
  "src/infrastructure/network",
  "src/infrastructure/analytics",

  "src/lib",
  "src/types",

  "assets/fonts",
  "assets/pictograms",
  "docs/screens",
  "scripts"
)

foreach ($d in $dirs) {
  $full = Join-Path $Root $d
  if (-not (Test-Path $full)) {
    New-Item -ItemType Directory -Path $full -Force | Out-Null
  }
}

Write-Host "  OK  Directories created" -ForegroundColor Green

# ─── .gitkeep in empty dirs ─────────────────────────────
Write-Host "Creating .gitkeep files..." -ForegroundColor Cyan

$srcPath = Join-Path $Root "src"
Get-ChildItem -Path $srcPath -Directory -Recurse |
  Where-Object { (Get-ChildItem -Path $_.FullName -Force | Measure-Object).Count -eq 0 } |
  ForEach-Object {
    New-Item -ItemType File -Path (Join-Path $_.FullName ".gitkeep") -Force | Out-Null
  }

# ─── Root AGENTS.md ─────────────────────────────────────
$rootAgents = Join-Path $Root "AGENTS.md"
if (-not (Test-Path $rootAgents)) {
  $content = @"
# AGENTS.md — Kinetic Strength Analytics

Placeholder. Full version will be added after initial structure is committed.
"@
  Set-Content -Path $rootAgents -Value $content -Encoding UTF8
  Write-Host "  OK  AGENTS.md (root)" -ForegroundColor Green
}

# ─── Layer-level AGENTS.md placeholders ─────────────────
Write-Host "Placing layer AGENTS.md files..." -ForegroundColor Cyan

$layerAgents = @(
  @{ Path = "src/domain"; Title = "Domain layer"; Desc = "Pure TypeScript, no UI/state/network." },
  @{ Path = "src/components"; Title = "Shared components"; Desc = "Cross-feature UI primitives." },
  @{ Path = "src/features/workout"; Title = "Workout feature"; Desc = "Core logging flow. Zero tolerance for data loss." },
  @{ Path = "src/features/analytics"; Title = "Analytics feature"; Desc = "Read-only analytics. Calculations live in domain/rules." },
  @{ Path = "src/features/routines"; Title = "Routines feature"; Desc = "Routine CRUD and exercise picker." },
  @{ Path = "src/features/auth"; Title = "Auth feature"; Desc = "Authentication and session management." },
  @{ Path = "src/features/onboarding"; Title = "Onboarding feature"; Desc = "First-run setup flow (5 screens)." },
  @{ Path = "src/features/history"; Title = "History feature"; Desc = "Session history list and read-only detail." },
  @{ Path = "src/features/profile"; Title = "Profile feature"; Desc = "Account, settings, and preferences." }
)

foreach ($layer in $layerAgents) {
  $agentsPath = Join-Path $Root ($layer.Path + "/AGENTS.md")
  if (-not (Test-Path $agentsPath)) {
    $content = @"
# AGENTS.md — $($layer.Path)

$($layer.Desc)

Full rules will be added after the initial structure is committed.
"@
    Set-Content -Path $agentsPath -Value $content -Encoding UTF8
  }
}

Write-Host ""
Write-Host "OK  Structure initialized." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Review the tree:   tree /F /A src"
Write-Host "  2. Add dependencies:  see package-additions.txt"
Write-Host "  3. Replace placeholder AGENTS.md files with full versions."
Write-Host "  4. Commit:            git add . ; git commit -m 'chore: init structure'"