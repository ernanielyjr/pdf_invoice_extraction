import args from "args";
import fs from "fs";
import { InvoiceOutput, Statement } from "../model";
import { OfxCreditCard } from "./ofx/OfxCreditCard";

export function argsParser() {
  const filename = __filename.replace(process.cwd(), ".");
  args
    .option(["i", "input"], "Input JSON file to convert")
    .option(["o", "output"], "Output OFX file to write")
    .examples([
      {
        description: "Using args",
        usage: `node ${filename} -i invoice.json -o invoice.ofx`,
      },
      {
        description: "Using stream",
        usage: `cat invoice.json | node ${filename} > invoice.ofx`,
      },
      {
        description: "Using both modes",
        usage: `cat invoice.json | node ${filename} -o invoice.ofx`,
      },
    ]);

  return args.parse(process.argv);
}

export async function getContent(flagsInput: string, isStream: boolean) {
  let content = "";

  if (!isStream && !fs.existsSync(flagsInput)) {
    throw new Error(`File not found: ${flagsInput}`);
  } else if (!isStream) {
    content = fs.readFileSync(flagsInput, "utf8");
  } else {
    process.stdin.setEncoding("utf8");
    const chunks: string[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk.toString());
    }

    content = chunks.join("");
  }

  if (!content) {
    throw new Error("Empty content");
  }

  const file: InvoiceOutput = JSON.parse(content);
  if (!file) {
    throw new Error("Invalid content");
  }

  if (!Array.isArray(file.statements)) {
    throw new Error("Invalid file content");
  }

  return file.statements;
}

export function makeTheOutput(
  ofxInvoice: OfxCreditCard,
  isStream: boolean,
  outputFilename?: string
) {
  const formattedFinal = ofxInvoice.toString();

  if (!isStream && outputFilename) {
    fs.writeFileSync(outputFilename, formattedFinal);
    return;
  }

  console.log(formattedFinal);
}

export function getOfxInvoice(statements: Statement[]): OfxCreditCard {
  const ofxInvoice = new OfxCreditCard();
  for (const statement of statements) {
    const [currentInstalment, totalInstalments] = (statement.instalments || "")
      .split("/")
      .map((statement: string) => parseInt(statement, 10));

    ofxInvoice.addStatement({
      type: statement.amount < 0 ? "CREDIT" : "DEBIT",
      date: new Date(statement.date),
      amount: statement.amount * -1,
      description: statement.description,
      currentInstalment,
      totalInstalments,
    });
  }

  return ofxInvoice;
}
