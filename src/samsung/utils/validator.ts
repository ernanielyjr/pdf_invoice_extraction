export function textIsCategory(text?: string) {
  return [
    "alimentacao",
    "compras",
    "educacao",
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

export function isAmount(text?: string) {
  return (text || "").includes("R$ ");
}

export function isDate(text?: string) {
  return (text || "").includes(", 20");
}

export function isInstalments(text?: string) {
  return (text || "").includes("parcela ");
}

export function isDescription(text?: string) {
  return !isAmount(text) && !isDate(text) && !isInstalments(text);
}
