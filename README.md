# PDF Invoice Extraction

This project can read a credit card invoice PDF file, convert to JSON and then convert this JSON to a OFX (Open Financial Exchange) file.

The PDF parser is made through [Tabula Java](https://github.com/tabulapdf/tabula-java) project.

## Accepted PDF invoices:

- Samsung Itaucard
- `TODO:` Sicoob
- `TODO:` Inter
- `TODO:` Nubank

## How to build

Install the dependencies

```sh
npm i
```

Build the project

```sh
npm run build
```

## How to use

Once the project compiled, you can run thes commands to get help:

```sh
node ./dist/samsung/samsung.js --help
node ./dist/jsonToOfx/jsonToOfx.js --help
```

Usage examples:

```sh
# Examples to convert PDF to JSON
cat invoice.pdf | node ./dist/samsung/samsung.js > invoice.json
cat invoice.pdf | node ./dist/samsung/samsung.js -o invoice.json
node ./dist/samsung/samsung.js -i invoice.pdf -o invoice.json
node ./dist/samsung/samsung.js -i invoice.pdf > invoice.json
```

```sh
# Examples to convert JSON to OFX
cat invoice.json | node ./dist/jsonToOfx/jsonToOfx.js > invoice.ofx
cat invoice.json | node ./dist/jsonToOfx/jsonToOfx.js -o invoice.ofx
node ./dist/jsonToOfx/jsonToOfx.js -i invoice.json -o invoice.ofx
node ./dist/jsonToOfx/jsonToOfx.js -i invoice.json > invoice.ofx
```

```sh
# Examples to convert PDF to OFX
cat invoice.pdf | node ./dist/samsung/samsung.js | node ./dist/jsonToOfx/jsonToOfx.js > invoice.ofx
node ./dist/samsung/samsung.js -i invoice.pdf | node ./dist/jsonToOfx/jsonToOfx.js -o invoice.ofx
```
