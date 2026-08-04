param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath,
  [Parameter(Mandatory=$true)][int]$Size
)
Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile($InputPath)
$side = [Math]::Min($src.Width, $src.Height)
$cropX = [int](($src.Width - $side) / 2)
$cropY = [int](($src.Height - $side) / 2)
$cropped = New-Object System.Drawing.Bitmap $side, $side
$g1 = [System.Drawing.Graphics]::FromImage($cropped)
$g1.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $side, $side), (New-Object System.Drawing.Rectangle $cropX, $cropY, $side, $side), [System.Drawing.GraphicsUnit]::Pixel)
$g1.Dispose()
$src.Dispose()

$out = New-Object System.Drawing.Bitmap $Size, $Size
$g2 = [System.Drawing.Graphics]::FromImage($out)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($cropped, 0, 0, $Size, $Size)
$g2.Dispose()
$cropped.Dispose()

$out.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()
Write-Output "Done: $OutputPath ($Size x $Size)"
