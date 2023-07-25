rm ./data/*-samsung.json 2> /dev/null

INVOICES["202210"]=0.00
INVOICES["202211"]=0.00
INVOICES["202212"]=0.00
INVOICES["202301"]=0.00
INVOICES["202302"]=0.00
INVOICES["202306"]=0.00
INVOICES["202307"]=0.00

for INVOICE_DATE in "${!INVOICES[@]}"
do
  echo "Extracting $INVOICE_DATE (R$ ${INVOICES[$INVOICE_DATE]})"
    node ./dist/samsung.js ${INVOICES[$INVOICE_DATE]} $INVOICE_DATE \
    > ./data/$INVOICE_DATE-samsung.json
done

echo all done.

