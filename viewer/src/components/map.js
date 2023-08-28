import React, { useRef, useEffect, useState } from 'react';
import * as pmtiles from 'pmtiles';
import { Pool, fromUrl } from 'geotiff';
import { encode } from 'fast-png';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

const REACT_APP_RASTER_XYZ_TILE_URL = process.env.REACT_APP_RASTER_XYZ_TILE_URL;
const REACT_APP_COG_URL = process.env.REACT_APP_COG_URL;
const REACT_APP_PMTILE_URL = process.env.REACT_APP_PMTILE_URL;
const REACT_APP_VECTOR_XYZ_TILE_URL = process.env.REACT_APP_VECTOR_XYZ_TILE_URL;
const REACT_APP_VECTOR_PMTILE_URL = process.env.REACT_APP_VECTOR_PMTILE_URL;

export default function Map(props) {
  const {
    isShowPmtilesLayer,
    isShowRasterXyzTileLayer,
    isShowCogLayer,
    isShowVectorXyzTileLayer,
    isShowVectorPmtilesLayer,
  } = props;

  const mapContainer = useRef(null);
  const [lng] = useState(139.8);
  const [lat] = useState(35.3);
  const [zoom] = useState(2);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map == null) return;

    map.setLayoutProperty('pmtiles-layer',
      'visibility', isShowPmtilesLayer ? 'visible' : 'none');

    map.setLayoutProperty('raster-xyz-tile-layer',
      'visibility', isShowRasterXyzTileLayer ? 'visible' : 'none');

    map.setLayoutProperty('cog-layer',
      'visibility', isShowCogLayer ? 'visible' : 'none');

    map.setLayoutProperty('vector-xyz-tile-layer',
      'visibility', isShowVectorXyzTileLayer ? 'visible' : 'none');

    map.setLayoutProperty('vector-pmtiles-layer',
      'visibility', isShowVectorPmtilesLayer ? 'visible' : 'none');

  }, [isShowPmtilesLayer, isShowRasterXyzTileLayer, isShowCogLayer, isShowVectorXyzTileLayer, isShowVectorPmtilesLayer]);


  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'gsi-pale-mod.json',
      center: [lng, lat],
      zoom: zoom,
      hash: true,
      maxZoom: 4,
      minZoom: 0
    });

    map.on('load', async () => {
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.showTileBoundaries = true;

      // Raster PMTiles
      {
        protocol.add(new pmtiles.PMTiles(REACT_APP_PMTILE_URL));

        map.addLayer({
          id: 'pmtiles-layer',
          type: 'raster',
          source: {
            type: 'raster',
            url: 'pmtiles://' + REACT_APP_PMTILE_URL,
            attribution: '<a href="https://www.naturalearthdata.com/" target="_blank">Made with Natural Earth.</a>',
          },
          layout: {
            visibility: 'visible',
          },
          minzoom: 0,
          maxzoom: 4,
        });
      }

      // Raster XYZ tile
      map.addLayer({
        id: 'raster-xyz-tile-layer',
        type: 'raster',
        source: {
          type: 'raster',
          tileSize: 256,
          tiles: [REACT_APP_RASTER_XYZ_TILE_URL],
          attribution: '<a href="https://www.naturalearthdata.com/" target="_blank">Made with Natural Earth.</a>',
        },
        layout: {
          visibility: 'none',
        },
        minzoom: 0,
        maxzoom: 4,
      });

      // Cloud Optimized GeoTiff
      map.addLayer({
        id: 'cog-layer',
        type: 'raster',
        source: await generateCogSource(REACT_APP_COG_URL),
        layout: {
          visibility: 'none',
        },
        minzoom: 0,
        maxzoom: 4,
      });

      // Vector XYZ Tile
      map.addLayer({
        id: 'vector-xyz-tile-layer',
        source: {
          type: 'vector',
          tiles: [REACT_APP_VECTOR_XYZ_TILE_URL],
          attribution: "<a href='https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_1.html' target='_blank'>「国土数値情報（行政区域データ）」を加工して作成</a>",
        },
        'source-layer': 'admini_boundary',
        type: 'fill',
        paint: {
          'fill-opacity': 0.5,
          'fill-color': 'red',
        },
        layout: {
          visibility: 'none',
        },
        minzoom: 0,
        maxzoom: 4,
      });

      // Vector PMTiles
      {
        protocol.add(new pmtiles.PMTiles(REACT_APP_VECTOR_PMTILE_URL));

        map.addLayer({
          id: 'vector-pmtiles-layer',
          'source-layer': 'admini_boundary',
          source: {
            type: 'vector',
            url: 'pmtiles://' + REACT_APP_VECTOR_PMTILE_URL,
            attribution: "<a href='https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_1.html' target='_blank'>「国土数値情報（行政区域データ）」を加工して作成</a>",
          },
          type: 'fill',
          paint: {
            'fill-opacity': 0.5,
            'fill-color': 'red',
          },
          layout: {
            visibility: 'none',
          },
          minzoom: 0,
          maxzoom: 4,
        });
      }

      setMap(map);
    });

    return () => {
      map.remove();
    }
  }, []);

  return (
    <div ref={mapContainer} className="map" />
  );
}

// タイル座標系からメルカトル座標系の bbox を返す。
const tile2mercatorBox = (x, y, z) => {
  const GEO_R = 6378137;
  const orgX = -1 * ((2 * GEO_R * Math.PI) / 2);
  const orgY = (2 * GEO_R * Math.PI) / 2;
  const unit = (2 * GEO_R * Math.PI) / Math.pow(2, z);
  const minx = orgX + x * unit;
  const maxx = orgX + (x + 1) * unit;
  const miny = orgY - (y + 1) * unit;
  const maxy = orgY - y * unit;
  return [minx, miny, maxx, maxy];
};

// Cloud Optimized GeoTIFF ソースを返す
const generateCogSource = async (url) => {
  const SIZE = 256; // タイルサイズ

  const tiff = await fromUrl(url);
  const pool = new Pool();

  maplibregl.addProtocol('cog', (params, callback) => {
    const segments = params.url.split('/');
    const [z, x, y] = segments.slice(segments.length - 3).map(x => Number(x));
    const bbox = tile2mercatorBox(x, y, z);

    tiff.readRasters({
      bbox,
      samples: [0, 1, 2, 3], // RGBA
      width: SIZE, height: SIZE,
      interleave: true,
      pool,
    })
      .then((data) => {
        callback(null, encode(new ImageData(new Uint8ClampedArray(data), SIZE, SIZE,)), null, null);
      })
      .catch((err) => {
        console.error(err);
      })

    return { cancel: () => { } };
  });

  return {
    type: 'raster',
    tiles: [`cog://${url.split('://')[1]}/{z}/{x}/{y}`],
    tileSize: SIZE,
    attribution: '<a href="https://www.naturalearthdata.com/" target="_blank">Made with Natural Earth.</a>',
  }
};
