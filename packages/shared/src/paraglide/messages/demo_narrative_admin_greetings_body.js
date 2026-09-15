/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Greetings_BodyInputs */

const en_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greetings are what callers hear when they reach a phone line. Five greeting types each serve a different point in the call flow, covering the initial answer, a language prompt, a new client greeting, an existing client greeting, and the staff menu.
**Formats.** Each greeting can be text rendered as speech by the telephony provider, or a recorded audio file, and audio recordings are not fetchable without authentication.
**Security tradeoff.** Greeting audio is stored as plaintext rather than encrypted, because every caller hears it and it contains no private information. This is the same treatment the product gives to branding and other outward facing content.
**Greetings by line.** Each phone line can have its own set of greetings for each type.
**Permissions.** Writing or updating greetings requires the Write call greetings permission.`)
};

const es_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los saludos son lo que escuchan los llamantes cuando se comunican con una línea telefónica. Cinco tipos de saludo sirven cada uno en un punto diferente del flujo de la llamada, cubriendo la respuesta inicial, la selección de idioma, un saludo para cliente nuevo, otro para cliente existente y el menú de personal.
**Formatos.** Cada saludo puede ser texto convertido en voz por el proveedor de telefonía, o un archivo de audio grabado, y las grabaciones de audio no son accesibles sin autenticación.
**Compromiso de seguridad.** El audio de los saludos se almacena en texto plano en lugar de cifrarse, porque cada llamante lo escucha y no contiene información privada. Es el mismo tratamiento que el producto da a la marca y al resto del contenido dirigido al exterior.
**Saludos por línea.** Cada línea telefónica puede tener su propio conjunto de saludos para cada tipo.
**Permisos.** Escribir o actualizar saludos requiere el permiso Escribir saludos de llamada.`)
};

/**
* | output |
* | --- |
* | "Greetings are what callers hear when they reach a phone line. Five greeting types each serve a different point in the call flow, covering the initial answer,..." |
*
* @param {Demo_Narrative_Admin_Greetings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_greetings_body = /** @type {((inputs?: Demo_Narrative_Admin_Greetings_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Greetings_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_greetings_body(inputs)
	return en_demo_narrative_admin_greetings_body(inputs)
});