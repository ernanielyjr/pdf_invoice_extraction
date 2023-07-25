INVOICE_DATE="06-2023"
EXPECTED_ITEMS_COUNT=97
EXPECTED_ITEMS_SUM=5732.47

rm ./data/samsung-$INVOICE_DATE.json
java -jar ./bin/tabula.jar ./data/samsung-$INVOICE_DATE.pdf --pages all --format JSON --silent \
  | node ./src/temp.js $EXPECTED_ITEMS_COUNT $EXPECTED_ITEMS_SUM $INVOICE_DATE \
  > ./data/samsung-$INVOICE_DATE.json


INVOICE_DATE="07-2023"
EXPECTED_ITEMS_COUNT=88
EXPECTED_ITEMS_SUM=4993.07

rm ./data/samsung-$INVOICE_DATE.json
java -jar ./bin/tabula.jar ./data/samsung-$INVOICE_DATE.pdf --pages all --format JSON --silent \
  | node ./src/temp.js $EXPECTED_ITEMS_COUNT $EXPECTED_ITEMS_SUM $INVOICE_DATE \
  > ./data/samsung-$INVOICE_DATE.json
