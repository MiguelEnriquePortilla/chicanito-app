param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath,
  [string]$BgColor = "255,0,255"
)
Add-Type -AssemblyName System.Drawing
$parts = $BgColor.Split(',')
$color = [System.Drawing.Color]::FromArgb([int]$parts[0], [int]$parts[1], [int]$parts[2])

$src = [System.Drawing.Bitmap]::FromFile($InputPath)
$bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear($color)
$g.DrawImage($src, 0, 0, $src.Width, $src.Height)
$g.Dispose()
$src.Dispose()
$bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()
Write-Output "Done: $OutputPath"
