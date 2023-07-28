import ofx from "ofx";
import { v5 } from "uuid";
import { round } from "../../helpers";
import { Statement, V5_TYPES } from "./OfxCreditCard.model";
import { OfxBody, OfxHeader, Stmttrn } from "./ofx.model";

export class OfxCreditCard {
  private date: Date;
  private id: string = "";
  private statements: Statement[] = [];

  constructor(date?: Date) {
    this.date = date || new Date();
    this.id = v5(this.date.toISOString(), V5_TYPES.INVOICE_ID);
  }

  private dateToString(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}${month}${day}000000[-3:GMT]`;
  }

  private getHeader(): OfxHeader {
    return {
      OFXHEADER: "100",
      DATA: "OFXSGML",
      VERSION: "102",
      SECURITY: "NONE",
      ENCODING: "USASCII",
      CHARSET: "1252",
      COMPRESSION: "NONE",
      OLDFILEUID: "NONE",
      NEWFILEUID: "NONE",
    };
  }

  private getBody(): OfxBody {
    const allDateTimes = this.statements.map((item) => item.date.getTime());
    if (!allDateTimes.length) {
      allDateTimes.push(this.date.getTime());
    }

    const firstStatementDate = new Date(Math.min(...allDateTimes));
    const lastStatementDate = new Date(Math.max(...allDateTimes));

    const statementsDebitSum = round(
      this.statements
        .filter((item) => item.type === "DEBIT")
        .reduce((acc, item) => acc + item.amount, 0)
    );

    const stmttrn: Stmttrn[] = this.statements.map((statement) => {
      let descriptionSuffix = "";

      if (statement.totalInstalments && statement.currentInstalment) {
        descriptionSuffix = ` (${statement.currentInstalment}/${statement.totalInstalments})`;
      }

      const formattedDate = this.dateToString(statement.date);
      const formattedAmount = statement.amount.toFixed(2);
      const formattedDescription = `${statement.description}${descriptionSuffix}`;

      const hash = v5(
        `${statement.type}${formattedDate}${formattedAmount}${formattedDescription}`,
        V5_TYPES.STATEMENT_ID
      );

      return {
        TRNTYPE: statement.type,
        DTPOSTED: formattedDate,
        TRNAMT: formattedAmount,
        FITID: hash,
        MEMO: formattedDescription,
      };
    });

    return {
      SIGNONMSGSRSV1: {
        SONRS: {
          STATUS: {
            CODE: 0,
            SEVERITY: "INFO",
          },
          DTSERVER: this.dateToString(this.date),
          LANGUAGE: "POR",
        },
      },
      CREDITCARDMSGSRSV1: {
        CCSTMTTRNRS: {
          TRNUID: "1001",
          STATUS: {
            CODE: 0,
            SEVERITY: "INFO",
          },
          CCSTMTRS: {
            CURDEF: "BRL",
            CCACCTFROM: {
              ACCTID: this.id,
            },
            BANKTRANLIST: {
              DTSTART: this.dateToString(firstStatementDate),
              DTEND: this.dateToString(lastStatementDate),
              STMTTRN: stmttrn,
            },
            LEDGERBAL: {
              BALAMT: statementsDebitSum.toFixed(2),
              DTASOF: this.dateToString(lastStatementDate),
            },
          },
        },
      },
    };
  }

  addStatement(statement: Statement) {
    this.statements.push(statement);
  }

  toString() {
    return ofx.serialize(this.getHeader(), this.getBody());
  }
}
