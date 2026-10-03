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
  "linea", // línea
  "ingles", // inglés
  "espanol", // español
  "estan", // están
  "actua", // actúa
  "admision", // admisión
  "analisis", // análisis
  "apareceran", // aparecerán
  "asesoria", // asesoría
  "boton", // botón
  "cajon", // cajón
  "clausulas", // cláusulas
  "confias", // confías
  "cronologia", // cronología
  "dano", // daño
  "deberia", // debería
  "demas", // demás
  "desplazate", // desplázate
  "digito", // dígito
  "distribuira", // distribuirá
  "dividiran", // dividirán
  "enganada", // engañada
  "envia", // envía
  "envian", // envían
  "envias", // envías
  "estara", // estará
  "exportacion", // exportación
  "fisica", // física
  "fisicas", // físicas
  "guia", // guía
  "guias", // guías
  "incluiran", // incluirán
  "leera", // leerá
  "llamanos", // llámanos
  "manana", // mañana
  "mayoria", // mayoría
  "metodo", // método
  "minimo", // mínimo
  "moveran", // moverán
  "paises", // países
  "pestanas", // pestañas
  "podran", // podrán
  "politica", // política
  "proximos", // próximos
  "sabra", // sabrá
  "sintesis", // síntesis
  "tecnico", // técnico
  "telefonica", // telefónica
  "telefonicas", // telefónicas
  "traves", // través
  "ultimos", // últimos
  "vacio", // vacío
  "via", // vía
  "volveran", // volverán
] as const;

/**
 * Keys whose values may legitimately contain a listed bare form.
 *
 * Empty: its two entries existed only to excuse "quien", which is no
 * longer a listed bare form. An allowlist entry skips every check for
 * that key, so keeping them would have hidden any other missing accent
 * in those two values.
 */
const ALLOWLIST: ReadonlySet<string> = new Set<string>([]);

/**
 * "quien" is correct unaccented as a relative pronoun ("Solo quien posea
 * la clave", "lo que escucha quien llama"), and the corpus uses it that
 * way roughly ninety times, so it cannot sit in ALWAYS_ACCENTED. The
 * interrogative does need its accent, and it is identifiable: Spanish
 * opens a direct question with an inverted mark, so an interrogative
 * "quién" is the first word after "¿".
 *
 * A relative pronoun inside a question stays unaccented ("¿Qué ve quien
 * llama?"), which is why this anchors on the mark rather than scanning
 * the whole question.
 */
const BARE_INTERROGATIVE_QUIEN = /¿\s*quien\b/iu;

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

  it("no question opens with an unaccented interrogative quien", () => {
    const offenders: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== "string") continue;
      if (BARE_INTERROGATIVE_QUIEN.test(value)) {
        offenders.push(
          `${key}: opens a question with "quien" (${value.slice(0, 60)})`,
        );
      }
    }
    expect(offenders).toEqual([]);
  });
});
