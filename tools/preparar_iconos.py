"""Package the exact seal embedded in the identity PDF; do not trace or redraw."""
from pathlib import Path
from PIL import Image
import json,hashlib,base64
PROJECT=Path(__file__).resolve().parents[1]
source=PROJECT/'assets/brand/sello-marca-2026-original.png'
original=Image.open(source).convert('RGBA'); records=[]
for name,size,purpose in [('sello-2026-192.png',192,'any'),('sello-2026-512.png',512,'any'),('sello-2026-maskable-512.png',512,'maskable'),('sello-2026-apple-180.png',180,'apple-touch-icon')]:
 canvas=Image.new('RGBA',(size,size),'#FFFFFF');fit=int(size*.76) if purpose=='maskable' else size
 art=original.copy();art.thumbnail((fit,fit),Image.Resampling.LANCZOS)
 canvas.alpha_composite(art,((size-art.width)//2,(size-art.height)//2));dest=PROJECT/'assets/icons'/name;canvas.convert('RGB').save(dest)
 records.append({'asset':dest.relative_to(PROJECT).as_posix(),'size':[size,size],'purpose':purpose,'source':'assets/brand/sello-marca-2026-original.png','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'processing':'proportional resize, white canvas; no crop or redraw'})
png=base64.b64encode((PROJECT/'assets/icons/sello-2026-512.png').read_bytes()).decode()
svg='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>Chicken Chicanito. Very Sabrosito.</title><desc>Original brand seal preserved as an embedded PNG; this is not a vector tracing.</desc><image width="512" height="512" href="data:image/png;base64,'+png+'"/></svg>'
(PROJECT/'assets/icons/sello-2026.svg').write_text(svg,encoding='utf-8')
(PROJECT/'PWA-ICONS.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print('4 PNG icons and faithful SVG container built from the original 2026 seal.')
