export interface OfxHeader {
  OFXHEADER: string;
  DATA: string;
  VERSION: string;
  SECURITY: string;
  ENCODING: string;
  CHARSET: string;
  COMPRESSION: string;
  OLDFILEUID: string;
  NEWFILEUID: string;
}

export interface OfxBody {
  SIGNONMSGSRSV1: Signonmsgsrsv1;
  CREDITCARDMSGSRSV1: Creditcardmsgsrsv1;
}

interface Creditcardmsgsrsv1 {
  CCSTMTTRNRS: Ccstmttrnrs;
}

interface Ccstmttrnrs {
  TRNUID: string;
  STATUS: Status;
  CCSTMTRS: Ccstmtrs;
}

interface Ccstmtrs {
  CURDEF: Curdef;
  CCACCTFROM: Ccacctfrom;
  BANKTRANLIST: Banktranlist;
  LEDGERBAL: Ledgerbal;
}

type Curdef = "BRL";

interface Banktranlist {
  DTSTART: string;
  DTEND: string;
  STMTTRN: Stmttrn[];
}

export interface Stmttrn {
  TRNTYPE: Trntype;
  DTPOSTED: string;
  TRNAMT: string;
  FITID: string;
  MEMO: string;
}

type Trntype = "CREDIT" | "DEBIT";

interface Ccacctfrom {
  ACCTID: string;
}

interface Ledgerbal {
  BALAMT: string;
  DTASOF: string;
}

interface Status {
  CODE: number;
  SEVERITY: Severity;
}

type Severity = "INFO";

interface Signonmsgsrsv1 {
  SONRS: Sonrs;
}

interface Sonrs {
  STATUS: Status;
  DTSERVER: string;
  LANGUAGE: Language;
}

type Language = "POR";
