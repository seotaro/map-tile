# タイル

Cloud Optimized GeoTiff（以下、COG）

対応状況

|         |    MapLibre GL JS（v3.3.0）    | Mapbox GL JS（v2.14.1） | deck.gl |
| ------- | ------------------------------ | ----------------------- | ------- |
| PMTiles | pmtiles プロトコル             | TD                      | TD      |
| COG     | カスタムプロトコルの実装が必要 | TD                      | TD      |

## GeoTiff -> Raster Tile

```bash
gdal2tiles.py --zoom=1-5 --xyz src.tiff dest
```

## GeoTiff -> COG

```bash
gdal_translate src.tiff -projwin -180.0000000 85.0 180.0000000 -85.0 \
  -of COG dest.tiff \
  -co TILING_SCHEME=GoogleMapsCompatible \
  -co COMPRESS=DEFLATE
```

## GeoTiff -> (MBTiles) -> PMTiles

use [rio-mbtiles](https://github.com/mapbox/rio-mbtiless), [pmtiles](https://github.com/protomaps/go-pmtiles/releases)

```bash
rio mbtiles src.tiff temp.mbtiles \
  --format PNG --zoom-levels 0..4 --tile-size 256 --resampling bilinear
./pmtiles convert temp.mbtiles dest.pmtiles
```

[PMTiles Viewer](https://protomaps.github.io/PMTiles/)
