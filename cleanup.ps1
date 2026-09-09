# Portfolio cleanup - removes files replaced by .webp, orphaned assets,
# unused vendor builds and source maps.
# Run from the repo root:   powershell -ExecutionPolicy Bypass -File cleanup.ps1

$ErrorActionPreference = "Stop"
$removed = 0; $bytes = 0


# Unused vendor files, source maps and IE-era fonts
if (Test-Path "assets\vendor\aos\aos.cjs.js") { $bytes += (Get-Item "assets\vendor\aos\aos.cjs.js").Length; Remove-Item "assets\vendor\aos\aos.cjs.js" -Force; $removed++ }
if (Test-Path "assets\vendor\aos\aos.esm.js") { $bytes += (Get-Item "assets\vendor\aos\aos.esm.js").Length; Remove-Item "assets\vendor\aos\aos.esm.js" -Force; $removed++ }
if (Test-Path "assets\vendor\aos\aos.js.map") { $bytes += (Get-Item "assets\vendor\aos\aos.js.map").Length; Remove-Item "assets\vendor\aos\aos.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap-icons\bootstrap-icons.json") { $bytes += (Get-Item "assets\vendor\bootstrap-icons\bootstrap-icons.json").Length; Remove-Item "assets\vendor\bootstrap-icons\bootstrap-icons.json" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap-icons\bootstrap-icons.min.css") { $bytes += (Get-Item "assets\vendor\bootstrap-icons\bootstrap-icons.min.css").Length; Remove-Item "assets\vendor\bootstrap-icons\bootstrap-icons.min.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap-icons\bootstrap-icons.scss") { $bytes += (Get-Item "assets\vendor\bootstrap-icons\bootstrap-icons.scss").Length; Remove-Item "assets\vendor\bootstrap-icons\bootstrap-icons.scss" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-grid.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-grid.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-grid.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-grid.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-grid.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-grid.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-grid.min.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-grid.min.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-grid.min.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-grid.min.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-grid.min.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-grid.min.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-grid.rtl.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-grid.rtl.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-grid.rtl.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-grid.rtl.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-grid.rtl.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-grid.rtl.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-grid.rtl.min.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-grid.rtl.min.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-grid.rtl.min.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-grid.rtl.min.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-grid.rtl.min.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-grid.rtl.min.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-reboot.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-reboot.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-reboot.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-reboot.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-reboot.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-reboot.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-reboot.min.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-reboot.min.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-reboot.min.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-reboot.min.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-reboot.min.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-reboot.min.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.min.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.min.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.min.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.min.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.min.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-reboot.rtl.min.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-utilities.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-utilities.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-utilities.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-utilities.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-utilities.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-utilities.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-utilities.min.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-utilities.min.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-utilities.min.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-utilities.min.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-utilities.min.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-utilities.min.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.min.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.min.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.min.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.min.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.min.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap-utilities.rtl.min.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap.min.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap.min.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap.min.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap.rtl.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap.rtl.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap.rtl.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap.rtl.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap.rtl.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap.rtl.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap.rtl.min.css") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap.rtl.min.css").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap.rtl.min.css" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\css\bootstrap.rtl.min.css.map") { $bytes += (Get-Item "assets\vendor\bootstrap\css\bootstrap.rtl.min.css.map").Length; Remove-Item "assets\vendor\bootstrap\css\bootstrap.rtl.min.css.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.bundle.js") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.bundle.js").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.bundle.js" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.bundle.js.map") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.bundle.js.map").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.bundle.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.bundle.min.js.map") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.bundle.min.js.map").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.bundle.min.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.esm.js") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.esm.js").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.esm.js" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.esm.js.map") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.esm.js.map").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.esm.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.esm.min.js") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.esm.min.js").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.esm.min.js" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.esm.min.js.map") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.esm.min.js.map").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.esm.min.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.js") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.js").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.js" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.js.map") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.js.map").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.min.js") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.min.js").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.min.js" -Force; $removed++ }
if (Test-Path "assets\vendor\bootstrap\js\bootstrap.min.js.map") { $bytes += (Get-Item "assets\vendor\bootstrap\js\bootstrap.min.js.map").Length; Remove-Item "assets\vendor\bootstrap\js\bootstrap.min.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\boxicons\css\animations.css") { $bytes += (Get-Item "assets\vendor\boxicons\css\animations.css").Length; Remove-Item "assets\vendor\boxicons\css\animations.css" -Force; $removed++ }
if (Test-Path "assets\vendor\boxicons\css\boxicons.css") { $bytes += (Get-Item "assets\vendor\boxicons\css\boxicons.css").Length; Remove-Item "assets\vendor\boxicons\css\boxicons.css" -Force; $removed++ }
if (Test-Path "assets\vendor\boxicons\css\transformations.css") { $bytes += (Get-Item "assets\vendor\boxicons\css\transformations.css").Length; Remove-Item "assets\vendor\boxicons\css\transformations.css" -Force; $removed++ }
if (Test-Path "assets\vendor\boxicons\fonts\boxicons.eot") { $bytes += (Get-Item "assets\vendor\boxicons\fonts\boxicons.eot").Length; Remove-Item "assets\vendor\boxicons\fonts\boxicons.eot" -Force; $removed++ }
if (Test-Path "assets\vendor\boxicons\fonts\boxicons.svg") { $bytes += (Get-Item "assets\vendor\boxicons\fonts\boxicons.svg").Length; Remove-Item "assets\vendor\boxicons\fonts\boxicons.svg" -Force; $removed++ }
if (Test-Path "assets\vendor\glightbox\css\glightbox.css") { $bytes += (Get-Item "assets\vendor\glightbox\css\glightbox.css").Length; Remove-Item "assets\vendor\glightbox\css\glightbox.css" -Force; $removed++ }
if (Test-Path "assets\vendor\glightbox\js\glightbox.js") { $bytes += (Get-Item "assets\vendor\glightbox\js\glightbox.js").Length; Remove-Item "assets\vendor\glightbox\js\glightbox.js" -Force; $removed++ }
if (Test-Path "assets\vendor\isotope-layout\isotope.pkgd.js") { $bytes += (Get-Item "assets\vendor\isotope-layout\isotope.pkgd.js").Length; Remove-Item "assets\vendor\isotope-layout\isotope.pkgd.js" -Force; $removed++ }
if (Test-Path "assets\vendor\php-email-form\validate.js") { $bytes += (Get-Item "assets\vendor\php-email-form\validate.js").Length; Remove-Item "assets\vendor\php-email-form\validate.js" -Force; $removed++ }
if (Test-Path "assets\vendor\purecounter\purecounter_vanilla.js.map") { $bytes += (Get-Item "assets\vendor\purecounter\purecounter_vanilla.js.map").Length; Remove-Item "assets\vendor\purecounter\purecounter_vanilla.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\swiper\swiper-bundle.min.js.map") { $bytes += (Get-Item "assets\vendor\swiper\swiper-bundle.min.js.map").Length; Remove-Item "assets\vendor\swiper\swiper-bundle.min.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\typed.js\typed.cjs") { $bytes += (Get-Item "assets\vendor\typed.js\typed.cjs").Length; Remove-Item "assets\vendor\typed.js\typed.cjs" -Force; $removed++ }
if (Test-Path "assets\vendor\typed.js\typed.cjs.map") { $bytes += (Get-Item "assets\vendor\typed.js\typed.cjs.map").Length; Remove-Item "assets\vendor\typed.js\typed.cjs.map" -Force; $removed++ }
if (Test-Path "assets\vendor\typed.js\typed.module.js") { $bytes += (Get-Item "assets\vendor\typed.js\typed.module.js").Length; Remove-Item "assets\vendor\typed.js\typed.module.js" -Force; $removed++ }
if (Test-Path "assets\vendor\typed.js\typed.module.js.map") { $bytes += (Get-Item "assets\vendor\typed.js\typed.module.js.map").Length; Remove-Item "assets\vendor\typed.js\typed.module.js.map" -Force; $removed++ }
if (Test-Path "assets\vendor\typed.js\typed.umd.js.map") { $bytes += (Get-Item "assets\vendor\typed.js\typed.umd.js.map").Length; Remove-Item "assets\vendor\typed.js\typed.umd.js.map" -Force; $removed++ }

# Orphaned images (nothing references them)
if (Test-Path "assets\img\BackPP2.jpg") { $bytes += (Get-Item "assets\img\BackPP2.jpg").Length; Remove-Item "assets\img\BackPP2.jpg" -Force; $removed++ }
if (Test-Path "assets\img\MERN-logo.png") { $bytes += (Get-Item "assets\img\MERN-logo.png").Length; Remove-Item "assets\img\MERN-logo.png" -Force; $removed++ }
if (Test-Path "assets\img\hero-bg.jpg") { $bytes += (Get-Item "assets\img\hero-bg.jpg").Length; Remove-Item "assets\img\hero-bg.jpg" -Force; $removed++ }
if (Test-Path "assets\img\mern.png") { $bytes += (Get-Item "assets\img\mern.png").Length; Remove-Item "assets\img\mern.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\MERN-logo.png") { $bytes += (Get-Item "assets\img\portfolio\MERN-logo.png").Length; Remove-Item "assets\img\portfolio\MERN-logo.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\d.png") { $bytes += (Get-Item "assets\img\portfolio\d.png").Length; Remove-Item "assets\img\portfolio\d.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\data.png") { $bytes += (Get-Item "assets\img\portfolio\data.png").Length; Remove-Item "assets\img\portfolio\data.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\dsa.png") { $bytes += (Get-Item "assets\img\portfolio\dsa.png").Length; Remove-Item "assets\img\portfolio\dsa.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\interview.jpg") { $bytes += (Get-Item "assets\img\portfolio\interview.jpg").Length; Remove-Item "assets\img\portfolio\interview.jpg" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\logo.png") { $bytes += (Get-Item "assets\img\portfolio\logo.png").Length; Remove-Item "assets\img\portfolio\logo.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\mern.jpg") { $bytes += (Get-Item "assets\img\portfolio\mern.jpg").Length; Remove-Item "assets\img\portfolio\mern.jpg" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\react1.png") { $bytes += (Get-Item "assets\img\portfolio\react1.png").Length; Remove-Item "assets\img\portfolio\react1.png" -Force; $removed++ }

# Originals now replaced by .webp
if (Test-Path "assets\img\AI-Assistant.png") { $bytes += (Get-Item "assets\img\AI-Assistant.png").Length; Remove-Item "assets\img\AI-Assistant.png" -Force; $removed++ }
if (Test-Path "assets\img\Loading-img.png") { $bytes += (Get-Item "assets\img\Loading-img.png").Length; Remove-Item "assets\img\Loading-img.png" -Force; $removed++ }
if (Test-Path "assets\img\backMob.png") { $bytes += (Get-Item "assets\img\backMob.png").Length; Remove-Item "assets\img\backMob.png" -Force; $removed++ }
if (Test-Path "assets\img\mernn.png") { $bytes += (Get-Item "assets\img\mernn.png").Length; Remove-Item "assets\img\mernn.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\Auxes.png") { $bytes += (Get-Item "assets\img\portfolio\Auxes.png").Length; Remove-Item "assets\img\portfolio\Auxes.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\Free.png") { $bytes += (Get-Item "assets\img\portfolio\Free.png").Length; Remove-Item "assets\img\portfolio\Free.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\Java-Symbol.png") { $bytes += (Get-Item "assets\img\portfolio\Java-Symbol.png").Length; Remove-Item "assets\img\portfolio\Java-Symbol.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\Smart_Cart_&_Checkout_System.png") { $bytes += (Get-Item "assets\img\portfolio\Smart_Cart_&_Checkout_System.png").Length; Remove-Item "assets\img\portfolio\Smart_Cart_&_Checkout_System.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\crystallo.png") { $bytes += (Get-Item "assets\img\portfolio\crystallo.png").Length; Remove-Item "assets\img\portfolio\crystallo.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\dsaa.png") { $bytes += (Get-Item "assets\img\portfolio\dsaa.png").Length; Remove-Item "assets\img\portfolio\dsaa.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\favicon.ico") { $bytes += (Get-Item "assets\img\portfolio\favicon.ico").Length; Remove-Item "assets\img\portfolio\favicon.ico" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\interview1.jpeg") { $bytes += (Get-Item "assets\img\portfolio\interview1.jpeg").Length; Remove-Item "assets\img\portfolio\interview1.jpeg" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\major.png") { $bytes += (Get-Item "assets\img\portfolio\major.png").Length; Remove-Item "assets\img\portfolio\major.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\maps.png") { $bytes += (Get-Item "assets\img\portfolio\maps.png").Length; Remove-Item "assets\img\portfolio\maps.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\meta.png") { $bytes += (Get-Item "assets\img\portfolio\meta.png").Length; Remove-Item "assets\img\portfolio\meta.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\princeOfDeals.png") { $bytes += (Get-Item "assets\img\portfolio\princeOfDeals.png").Length; Remove-Item "assets\img\portfolio\princeOfDeals.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\princeOfDealsBack.png") { $bytes += (Get-Item "assets\img\portfolio\princeOfDealsBack.png").Length; Remove-Item "assets\img\portfolio\princeOfDealsBack.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\react2.png") { $bytes += (Get-Item "assets\img\portfolio\react2.png").Length; Remove-Item "assets\img\portfolio\react2.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\react3.png") { $bytes += (Get-Item "assets\img\portfolio\react3.png").Length; Remove-Item "assets\img\portfolio\react3.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\testProf.png") { $bytes += (Get-Item "assets\img\portfolio\testProf.png").Length; Remove-Item "assets\img\portfolio\testProf.png" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\urbankart.png") { $bytes += (Get-Item "assets\img\portfolio\urbankart.png").Length; Remove-Item "assets\img\portfolio\urbankart.png" -Force; $removed++ }
if (Test-Path "assets\img\profile.jpg") { $bytes += (Get-Item "assets\img\profile.jpg").Length; Remove-Item "assets\img\profile.jpg" -Force; $removed++ }


# Merged into main.js
if (Test-Path "assets\js\main2.js") { $bytes += (Get-Item "assets\js\main2.js").Length; Remove-Item "assets\js\main2.js" -Force; $removed++ }

# Replaced by the purpose-made covers in assets/img/blog/
if (Test-Path "assets\img\mernn.webp") { $bytes += (Get-Item "assets\img\mernn.webp").Length; Remove-Item "assets\img\mernn.webp" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\Java-Symbol.webp") { $bytes += (Get-Item "assets\img\portfolio\Java-Symbol.webp").Length; Remove-Item "assets\img\portfolio\Java-Symbol.webp" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\major.webp") { $bytes += (Get-Item "assets\img\portfolio\major.webp").Length; Remove-Item "assets\img\portfolio\major.webp" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\Free.webp") { $bytes += (Get-Item "assets\img\portfolio\Free.webp").Length; Remove-Item "assets\img\portfolio\Free.webp" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\interview1.webp") { $bytes += (Get-Item "assets\img\portfolio\interview1.webp").Length; Remove-Item "assets\img\portfolio\interview1.webp" -Force; $removed++ }
if (Test-Path "assets\img\portfolio\dsaa.webp") { $bytes += (Get-Item "assets\img\portfolio\dsaa.webp").Length; Remove-Item "assets\img\portfolio\dsaa.webp" -Force; $removed++ }

Write-Host "Removed $removed files, freed $([math]::Round($bytes/1MB,2)) MB"
