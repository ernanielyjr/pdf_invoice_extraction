BASE_DIR=./data

BASE_FILE=$BASE_DIR/*-samsung

rm $BASE_FILE.json 2> /dev/null
rm $BASE_FILE.ofx 2> /dev/null

echo "=========================================="

chmod +x ./dist/samsung/samsung.js

for file in $BASE_FILE.pdf; do
  echo "Extracting: $file"

  ./dist/samsung/samsung.js --input $file --output "${file%.pdf}.json"
  echo "JSON saved: ${file%.pdf}.json"

  # node ./dist/jsonToOfx.js ./data/$INVOICE_DATE-samsung.json \
  #   > ./data/$INVOICE_DATE-samsung.ofx
  echo "OFX  saved: ${file%.pdf}.ofx"

  echo "done."
  echo "=========================================="
done

echo all done.

