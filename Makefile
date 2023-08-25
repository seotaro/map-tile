BUCKET := 2023-08-25_map-tile
SRC := HYP_50M_SR_W/HYP_50M_SR_W.tif

create-xyz-tile:
	mkdir -p output
	gdal2tiles.py --zoom=1-4 --xyz --webviewer=none $(SRC) output/raster-tile

create-raster-pmtiles:
	mkdir -p output
	rio mbtiles $(SRC) output/temp.mbtiles \
		--format PNG --zoom-levels 1..4 --tile-size 256 --resampling bilinear
	./pmtiles convert output/temp.mbtiles output/pmtiles.pmtiles
	rm output/temp.mbtiles

create-cloud-optimized-geotiff:
	mkdir -p output
	gdal_translate $(SRC) -projwin -180.0000000 85.0  180.0000000 -85.0 \
		-of COG output/cloud-optimized-geotiff.tiff \
		-co TILING_SCHEME=GoogleMapsCompatible \
		-co COMPRESS=DEFLATE

upload:
	gsutil -m -h "Cache-Control:public, max-age=15, no-store" cp -r output/* gs://$(BUCKET)

snippets:
	gsutil cors set cors_setting.json gs://$(BUCKET)

