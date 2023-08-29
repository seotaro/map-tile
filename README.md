# マップタイル

下記マップタイルの生成とレンダリングのメモ。

- XYZ Tile（ラスター）
- PMTiles（ラスター）
- Cloud Optimized GeoTiff（以下、COG）
- XYZ Tile（ベクター）

[ライブデモ](https://seotaro.github.io/map-tile/)

MapLibre GL JS（v3.3.0）を使ったレンダリングデモ。

## GeoTiff -> XYZ Tile（ラスター）

```bash
gdal2tiles.py --zoom=1-5 --xyz src.tiff dest
```

## GeoTiff -> PMTiles（ラスター）

use [rio-mbtiles](https://github.com/mapbox/rio-mbtiless), [pmtiles](https://github.com/protomaps/go-pmtiles/releases)

```bash
rio mbtiles src.tiff temp.mbtiles \
  --format PNG --zoom-levels 0..4 --tile-size 256 --resampling bilinear
./pmtiles convert temp.mbtiles dest.pmtiles
```

[PMTiles Viewer](https://protomaps.github.io/PMTiles/)

## GeoTiff -> COG

```bash
gdal_translate src.tiff -projwin -180.0000000 85.0 180.0000000 -85.0 \
  -of COG dest.tiff \
  -co TILING_SCHEME=GoogleMapsCompatible \
  -co COMPRESS=DEFLATE
```

## GeoJSON -> XYZ tile（ベクター）

```bash
tippecanoe --force --output-to-directory dest \
  --layer xxx \
  --minimum-zoom=0 --maximum-zoom=4 \
  --no-tile-compression \
  src.geojson
```

## GeoJSON -> PMTiles（ベクター）

```bash
tippecanoe --force --output temp.mbtiles \
  --layer xxx \
  --minimum-zoom=0 --maximum-zoom=4 \
  --no-tile-compression \
  src.geojson
./pmtiles convert temp.mbtiles dest.pmtiles
```

※ [felt/tippecanoe](https://github.com/felt/tippecanoe) で PMTiles が直接出力できるが、MapLibre pmtiles モジュールで読み込んだときに 'Wrong magic number for PMTiles archive' のエラーになる。
