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

# Recorte cuadrado centrado (mismo criterio que resize-icon.ps1)
$cropped = New-Object System.Drawing.Bitmap $side, $side
$gCrop = [System.Drawing.Graphics]::FromImage($cropped)
$gCrop.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $side, $side), (New-Object System.Drawing.Rectangle $cropX, $cropY, $side, $side), [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()
$src.Dispose()

# Lienzo final con canal alfa: fuera del círculo queda transparente,
# así el navy del manifest se ve directo detrás (igual que el CSS
# border-radius:50% del splash personalizado).
$out = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($out)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(0, 0, $Size, $Size)
$g.SetClip($path)
$g.DrawImage($cropped, 0, 0, $Size, $Size)
$g.Dispose()
$cropped.Dispose()
$path.Dispose()

$out.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()
Write-Output "Done: $OutputPath ($Size x $Size, circular)"
