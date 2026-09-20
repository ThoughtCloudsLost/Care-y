/**
 * Spanish spelling guard for message strings.
 *
 * The i18n layers that check translation coverage cannot tell a correctly
 * translated string from a misspelled one: a derived-corpus sweep passes
 * anything that is not English, and a pseudolocale passes anything that
 * went through the message pipeline. Seven shipped strings dropped
 * required accents before this guard existed, all hand-typed omissions
 * on capability-naming surfaces.
 *
 * This test scans every es.json value for unaccented forms of words this
 * corpus always writes accented. It is deliberately a denylist rather
 * than a dictionary: no dependency, no false positives from product
 * nouns, and each entry is a word whose bare form is effectively always
 * a typo in app copy. Extend the list when a new miss ships.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ES_PATH = join(HERE, "..", "messages", "es.json");

/**
 * Bare forms that must always carry an accent in this corpus. Matched
 * case-insensitively on word boundaries. Keep entries lowercase.
 */
const ALWAYS_ACCENTED = [
  "auditoria", // auditoría
  "estadistica", // estadística
  "estadisticas", // estadísticas
  "codigo", // código
  "codigos", // códigos
  "configuracion", // configuración
  "organizacion", // organización
  "informacion", // información
  "sesion", // sesión
  "telefono", // teléfono
  "numero", // número
  "electronico", // electrónico
  "electronica", // electrónica
  "podria", // podría
  "despues", // después
  "tambien", // también
  "categoria", // categoría
  "categorias", // categorías
  "articulo", // artículo
  "articulos", // artículos
  "dia", // día
  "dias", // días
  "aqui", // aquí
  "todavia", // todavía
  "ultima", // última
  "ultimo", // último
  "facil", // fácil
  "quien", // quién (interrogative; the corpus only uses it in questions)
  "linea", // línea
] as const;

/**
 * Keys whose values may legitimately contain a listed bare form.
 * Both entries use "quien" as an unaccented relative pronoun
 * ("Solo quien posea la clave", "quien ataque"), which is correct.
 */
const ALLOWLIST: ReadonlySet<string> = new Set([
  "demo_narrative_client_intake_fields_body",
  "demo_narrative_client_account_sign_in_body",
]);

describe("es.json accent spelling", () => {
  const data = JSON.parse(readFileSync(ES_PATH, "utf-8")) as Record<
    string,
    string
  >;

  const BARE_FORMS: ReadonlySet<string> = new Set(ALWAYS_ACCENTED);

  it("no value contains an unaccented form of an always-accented word", () => {
    const offenders: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== "string" || ALLOWLIST.has(key)) continue;
      const words = value.toLowerCase().match(/[\p{L}]+/gu) ?? [];
      for (const word of words) {
        if (BARE_FORMS.has(word)) {
          offenders.push(`${key}: contains "${word}" (${value.slice(0, 60)})`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
