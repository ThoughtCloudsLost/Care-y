/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Admin_Greetings_BodyInputs */

const en_demo_narrative_topic_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Topic_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recorded and text greetings are what callers hear when they reach a phone line. The demo seeds both greeting types and plays a real audio file through an authenticated preview endpoint. Adding or editing a greeting writes to the in-browser database.`)
};

const es_demo_narrative_topic_admin_greetings_body = /** @type {(inputs: Demo_Narrative_Topic_Admin_Greetings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los saludos grabados y de texto son lo que los llamantes escuchan al comunicarse con una linea telefonica. El demo incluye ambos tipos de saludo y reproduce un archivo de audio real a traves de un punto de vista previa autenticado. Agregar o editar un saludo escribe en la base de datos del navegador.`)
};

/**
* | output |
* | --- |
* | "Recorded and text greetings are what callers hear when they reach a phone line. The demo seeds both greeting types and plays a real audio file through an aut..." |
*
* @param {Demo_Narrative_Topic_Admin_Greetings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_admin_greetings_body = /** @type {((inputs?: Demo_Narrative_Topic_Admin_Greetings_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Admin_Greetings_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_admin_greetings_body(inputs)
	return es_demo_narrative_topic_admin_greetings_body(inputs)
});