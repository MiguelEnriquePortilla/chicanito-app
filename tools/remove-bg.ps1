param(
  [Parameter(Mandatory=$true)][string]$InputPath,
  [Parameter(Mandatory=$true)][string]$OutputPath,
  [int]$Tolerance = 18
)

Add-Type -AssemblyName System.Drawing

$src = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public static class BgRemover {
    public static void Remove(string inputPath, string outputPath, int tolerance) {
        Bitmap src = new Bitmap(inputPath);
        int w = src.Width, h = src.Height;
        Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(bmp)) {
            g.DrawImage(src, 0, 0, w, h);
        }
        src.Dispose();

        Rectangle rect = new Rectangle(0, 0, w, h);
        BitmapData bd = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = bd.Stride;
        byte[] bytes = new byte[stride * h];
        Marshal.Copy(bd.Scan0, bytes, 0, bytes.Length);

        bool[] visited = new bool[w * h];
        Queue<int> queue = new Queue<int>();
        int thresh = 255 - tolerance;

        Func<int,int,bool> isNearWhite = (x, y) => {
            int idx = y * stride + x * 4;
            byte b = bytes[idx], gg = bytes[idx+1], r = bytes[idx+2];
            return r >= thresh && gg >= thresh && b >= thresh;
        };

        for (int x = 0; x < w; x++) {
            SeedIfWhite(x, 0, w, visited, queue, isNearWhite);
            SeedIfWhite(x, h - 1, w, visited, queue, isNearWhite);
        }
        for (int y = 0; y < h; y++) {
            SeedIfWhite(0, y, w, visited, queue, isNearWhite);
            SeedIfWhite(w - 1, y, w, visited, queue, isNearWhite);
        }

        while (queue.Count > 0) {
            int p = queue.Dequeue();
            int x = p % w, y = p / w;
            int idx = y * stride + x * 4;
            bytes[idx + 3] = 0;

            TryEnqueue(x - 1, y, w, h, visited, queue, isNearWhite);
            TryEnqueue(x + 1, y, w, h, visited, queue, isNearWhite);
            TryEnqueue(x, y - 1, w, h, visited, queue, isNearWhite);
            TryEnqueue(x, y + 1, w, h, visited, queue, isNearWhite);
        }

        Marshal.Copy(bytes, 0, bd.Scan0, bytes.Length);
        bmp.UnlockBits(bd);
        bmp.Save(outputPath, ImageFormat.Png);
        bmp.Dispose();
    }

    static void SeedIfWhite(int x, int y, int w, bool[] visited, Queue<int> queue, Func<int,int,bool> isNearWhite) {
        int p = y * w + x;
        if (!visited[p] && isNearWhite(x, y)) {
            visited[p] = true;
            queue.Enqueue(p);
        }
    }

    static void TryEnqueue(int x, int y, int w, int h, bool[] visited, Queue<int> queue, Func<int,int,bool> isNearWhite) {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        int p = y * w + x;
        if (!visited[p] && isNearWhite(x, y)) {
            visited[p] = true;
            queue.Enqueue(p);
        }
    }
}
"@

Add-Type -TypeDefinition $src -ReferencedAssemblies System.Drawing

[BgRemover]::Remove($InputPath, $OutputPath, $Tolerance)
Write-Output "Done: $OutputPath"
