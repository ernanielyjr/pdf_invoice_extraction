export function itemIsNotTrash(item, index) {
  return item.text !== "" && index !== 4 && !textIsCategory(item.text);
}

export function textIsCategory(text) {
  return [
    "alimentacao",
    "compras",
    "lazer",
    "mercado",
    "moradia",
    "outros",
    "saude",
    "servicos",
    "transporte",
    "viagem",
  ].includes((text || "").toLowerCase());
}

export function isHeader(item) {
  return (
    item[0]?.text?.trim() === "DATA" &&
    item[1]?.text?.trim() === "ESTABELECIMENTO" &&
    item[2]?.text?.trim() === "VALOR"
  );
}

export function itemIsValid(item) {
  return (
    item.description &&
    item.date &&
    typeof item.amount === "number" &&
    typeof item.date === "object" &&
    typeof item.description === "string" &&
    item.description !== "PAGAMENTO"
  );
  // return Object.values(item).filter((value) => value).length >= 3;
}
