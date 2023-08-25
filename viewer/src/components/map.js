import React, { useRef, useEffect, useState } from 'react';
import * as pmtiles from 'pmtiles';
import { Pool, fromUrl } from 'geotiff';
import { encode } from 'fast-png';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

export default function Map(props) {
  const {
    isShowPmtilesLayer,
    isShowXyzTileLayer,
    isShowCogLayer,
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

    map.setLayoutProperty('xyz-tile-layer',
      'visibility', isShowXyzTileLayer ? 'visible' : 'none');

    map.setLayoutProperty('cog-layer',
      'visibility', isShowCogLayer ? 'visible' : 'none');

  }, [isShowPmtilesLayer, isShowXyzTileLayer, isShowCogLayer]);


  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'gsi-pale-mod.json',
      center: [lng, lat],
      zoom: zoom,
      hash: true,
    });

    map.on('load', async () => {
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.showTileBoundaries = true;

      // PMTile
      {
        const URL = 'https://storage.googleapis.com/2023-08-25_map-tile/pmtiles.pmtiles';
        protocol.add(new pmtiles.PMTiles(URL));

        map.addLayer({
          id: 'pmtiles-layer',
          type: 'raster',
          source: {
            type: 'raster',
            url: 'pmtiles://' + URL,
          },
          layout: {
            visibility: 'visible',
          },
          maxzoom: 4,
        });
      }

      // ラスタータイル
      map.addLayer({
        id: 'xyz-tile-layer',
        type: 'raster',
        source: {
          type: 'raster',
          tileSize: 256,
          tiles: ['https://storage.googleapis.com/2023-08-25_map-tile/raster-tile/{z}/{x}/{y}.png'],
        },
        layout: {
          visibility: 'none',
        },
        maxzoom: 4,
      });

      // Cloud Optimized GeoTiff
      map.addLayer({
        id: 'cog-layer',
        type: 'raster',
        source: await generateCogSource(
          'https://storage.googleapis.com/2023-08-25_map-tile/cloud-optimized-geotiff.tiff'
        ),
        layout: {
          visibility: 'none',
        },
        maxzoom: 4,
      });

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
  }
};
