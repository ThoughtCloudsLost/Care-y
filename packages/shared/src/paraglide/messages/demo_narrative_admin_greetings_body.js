/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Greetings_BodyInputs */

const en_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greetings are what callers hear when they reach a phone line. Five greeting types are supported. Answer, language prompt, new client, existing client, and staff menu each serve a different point in the call flow.
**Formats.** Each greeting can be text rendered as text to speech by the telephony provider, or a recorded audio file. Audio greetings play back through an authenticated endpoint in the admin interface.
**Per line configuration.** Each phone line can have its own set of greetings for each type.`)
};

const es_demo_narrative_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los saludos son lo que escuchan los llamantes cuando se comunican con una línea telefónica. Se admiten cinco tipos de saludo. Respuesta, selección de idioma, cliente nuevo, cliente existente y menú de personal sirven cada uno en un punto diferente del flujo de la llamada.
**Formatos.** Cada saludo puede ser texto convertido en voz por el proveedor de telefonía, o un archivo de audio grabado. Los saludos de audio se reproducen a través de un punto de acceso autenticado en la interfaz de administración.
**Configuración por línea.** Cada línea telefónica puede tener su propio conjunto de saludos para cada tipo.`)
};

/**
* | output |
* | --- |
* | "Greetings are what callers hear when they reach a phone line. Five greeting types are supported. Answer, language prompt, new client, existing client, and st..." |
*
* @param {Demo_Narrative_Admin_Greetings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_greetings_body = /** @type {((inputs?: Demo_Narrative_Admin_Greetings_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Greetings_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_greetings_body(inputs)
	return es_demo_narrative_admin_greetings_body(inputs)
});