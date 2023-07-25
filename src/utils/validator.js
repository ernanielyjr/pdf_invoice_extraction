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
