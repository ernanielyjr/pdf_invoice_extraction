BASE_DIR=./data

BASE_FILE=$BASE_DIR/*-samsung

rm $BASE_FILE.json 2> /dev/null
rm $BASE_FILE.ofx 2> /dev/null

echo "=========================================="

chmod +x ./dist/samsung/samsung.js
chmod +x ./dist/jsonToOfx/jsonToOfx.js

for file in $BASE_FILE.pdf; do
  echo "Extracting: $file"

  cat $file | ./dist/samsung/samsung.js | ./dist/jsonToOfx/jsonToOfx.js > "${file%.pdf}.ofx"
  echo "OFX  saved: ${file%.pdf}.ofx"

  echo "Done."
  echo "=========================================="
done

echo "All done!"

