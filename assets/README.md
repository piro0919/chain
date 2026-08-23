# assets

The faces drawn into the Open Graph card (`src/app/[locale]/opengraph-image.tsx`).

Latin runs in Geist, the same face the site uses. Geist has no Japanese, so the
Japanese tagline falls back to Zen Kaku Gothic New. Both are cut down to the
characters the card actually shows.

Any character missing from them silently falls back to a different face, so when
the card's copy changes, rebuild the subsets:

```sh
curl -sL -o /tmp/Geist.ttf \
  "https://github.com/google/fonts/raw/main/ofl/geist/Geist%5Bwght%5D.ttf"
curl -sL -o /tmp/ZenKakuGothicNew-Regular.ttf \
  "https://github.com/google/fonts/raw/main/ofl/zenkakugothicnew/ZenKakuGothicNew-Regular.ttf"

# Geist ships as a variable font. satori wants a fixed weight, so pin it first.
python3 - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
for wght, out in [(400, "/tmp/Geist-400.ttf"), (700, "/tmp/Geist-700.ttf")]:
    f = TTFont("/tmp/Geist.ttf")
    instancer.instantiateVariableFont(f, {"wght": wght}, inplace=True)
    f.save(out)
PY

TEXT="Chain Create organization charts from markdown. kkweb.io マークダウンから組織図を作る"
UNI="U+0020-007E,U+00A0-00FF,U+2010-2027,U+3000-303F,U+30FB"

pyftsubset /tmp/Geist-400.ttf --text="$TEXT" --unicodes="$UNI" \
  --output-file=assets/Geist-Regular-subset.ttf --no-hinting --desubroutinize --layout-features=''
pyftsubset /tmp/Geist-700.ttf --text="$TEXT" --unicodes="$UNI" \
  --output-file=assets/Geist-Bold-subset.ttf --no-hinting --desubroutinize --layout-features=''
pyftsubset /tmp/ZenKakuGothicNew-Regular.ttf --text="$TEXT" --unicodes="$UNI" \
  --output-file=assets/ZenKakuGothicNew-Regular-subset.ttf --no-hinting --desubroutinize --layout-features=''
```
