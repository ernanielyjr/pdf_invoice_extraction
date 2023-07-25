export function textIsCategory(text) {
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

export function isAmount(text) {
  return (text || "").includes("R$ ");
}

export function isDate(text) {
  return (text || "").includes(", 20");
}

export function isInstalments(text) {
  return (text || "").includes("parcela ");
}

export function isDescription(text) {
  return !isAmount(text) && !isDate(text) && !isInstalments(text);
}
