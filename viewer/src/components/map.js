import React, { useRef, useEffect, useState } from 'react';
import * as pmtiles from 'pmtiles';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

export default function Map(props) {
  const mapContainer = useRef(null);
  const [lng] = useState(139.8);
  const [lat] = useState(35.3);
  const [zoom] = useState(2);
  const [map, setMap] = useState(null);

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
        const URL = "https://storage.googleapis.com/2023-08-25_map-tile/pmtiles.pmtiles";
        protocol.add(new pmtiles.PMTiles(URL));

        map.addLayer({
          id: 'pmtiles',
          type: 'raster',
          source: {
            type: 'raster',
            url: 'pmtiles://' + URL,
          },
          minzoom: 0,
          maxzoom: 4,
        });
      }

      // ラスタータイル
      map.addLayer({
        id: "raster-tile",
        type: 'raster',
        source: {
          type: "raster",
          tileSize: 256,
          tiles: ["https://storage.googleapis.com/2023-08-25_map-tile/raster-tile/{z}/{x}/{y}.png"],
        },
        minzoom: 0,
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

