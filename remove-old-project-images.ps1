# Finishes the move of the project-section images into assets/project-images/.
#
# The copies already exist at the new path and index.html / projects.json
# already point there. This removes the originals under assets/img/portfolio/,
# but only after confirming the new copy exists and is byte-for-byte identical.
#
# Run from the repo root:
#   powershell -ExecutionPolicy Bypass -File remove-old-project-images.ps1
#
# Everything else in assets/img/portfolio/ is left alone on purpose — the
# testimonial images (favicon.webp, testProf.webp) and the linked PDFs are
# not project-section images.

$ErrorActionPreference = "Stop"

$names = @(
  "Auxes.webp", "Auxes-thumb.webp",
  "Smart_Cart_&_Checkout_System.webp", "Smart_Cart_&_Checkout_System-thumb.webp",
  "crystallo.webp", "crystallo-thumb.webp",
  "maps.webp", "maps-thumb.webp",
  "meta.webp", "meta-thumb.webp",
  "princeOfDeals.webp", "princeOfDeals-thumb.webp",
  "react2.webp", "react2-thumb.webp",
  "react3.webp", "react3-thumb.webp",
  "urbankart.webp", "urbankart-thumb.webp"
)

$old = "assets\img\portfolio"
$new = "assets\project-images"

if (-not (Test-Path $new)) {
  Write-Host "assets\project-images does not exist - nothing to finish." -ForegroundColor Yellow
  exit 1
}

$removed = 0
$bytes = 0
$skipped = @()

foreach ($name in $names) {
  $oldPath = Join-Path $old $name
  $newPath = Join-Path $new $name

  if (-not (Test-Path $oldPath)) { continue }   # already done

  if (-not (Test-Path $newPath)) {
    $skipped += "$name - no copy at $new"
    continue
  }

  $a = Get-FileHash -Algorithm SHA256 $oldPath
  $b = Get-FileHash -Algorithm SHA256 $newPath
  if ($a.Hash -ne $b.Hash) {
    $skipped += "$name - the two copies differ, leaving the original alone"
    continue
  }

  $bytes += (Get-Item $oldPath).Length
  Remove-Item $oldPath -Force
  $removed++
}

Write-Host ""
Write-Host "Removed $removed originals, freed $([math]::Round($bytes/1KB,1)) KB" -ForegroundColor Green

if ($skipped.Count -gt 0) {
  Write-Host ""
  Write-Host "Left in place:" -ForegroundColor Yellow
  $skipped | ForEach-Object { Write-Host "  $_" }
}

Write-Host ""
Write-Host "Next: git add -A   (git records this as a rename, so history follows the files)"
