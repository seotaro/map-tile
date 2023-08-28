BUCKET := 2023-08-25_map-tile
SRC := HYP_50M_SR_W/HYP_50M_SR_W.tif

create-raster-xyz-tile:
	mkdir -p output
	gdal2tiles.py --zoom=0-4 --xyz --webviewer=none $(SRC) output/raster-tile

create-raster-pmtiles:
	mkdir -p output
	rio mbtiles $(SRC) output/temp.mbtiles \
		--format PNG --zoom-levels 0..4 --tile-size 256 --resampling bilinear
	./pmtiles convert output/temp.mbtiles output/pmtiles.pmtiles
	rm output/temp.mbtiles

create-cloud-optimized-geotiff:
	mkdir -p output
	gdal_translate $(SRC) -projwin -180.0000000 85.0  180.0000000 -85.0 \
		-of COG output/cloud-optimized-geotiff.tiff \
		-co TILING_SCHEME=GoogleMapsCompatible \
		-co COMPRESS=DEFLATE

create-vector-xyz-tile:
	# tippecanoe input only geojson
	tippecanoe --force --output-to-directory output/vector-tile \
		--layer admini_boundary \
		--minimum-zoom=0 --maximum-zoom=4 \
		--no-tile-compression \
		N03-20230101_GML/N03-23_230101.geojson

create-vector-pmtile:
	# tippecanoe input only geojson
	# pmtiles directory output from tippecanoe is Wrong magic number for PMTiles archive
	tippecanoe --force --output output/temp.mbtiles \
		--layer admini_boundary \
		--minimum-zoom=0 --maximum-zoom=4 \
		--no-tile-compression \
		N03-20230101_GML/N03-23_230101.geojson
	./pmtiles convert output/temp.mbtiles output/vector-pmtile.pmtiles

upload:
	gsutil -m -h "Cache-Control:public, max-age=15, no-store" cp -r output/* gs://$(BUCKET)

snippets:
	gsutil cors set cors_setting.json gs://$(BUCKET)

