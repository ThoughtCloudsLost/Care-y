/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Editor_BodyInputs */

const en_demo_narrative_topic_library_editor_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Editor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The rich text editor supports headings, lists, links, and inline images. Articles are encrypted before storage with the organization key. Every change stays in the visitor's browser and never leaves the page.`)
};

const es_demo_narrative_topic_library_editor_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Editor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El editor de texto enriquecido admite encabezados, listas, enlaces e imagenes en linea. Los articulos se cifran antes del almacenamiento con la clave de la organizacion. Cada cambio permanece en el navegador del visitante y nunca sale de la pagina.`)
};

/**
* | output |
* | --- |
* | "The rich text editor supports headings, lists, links, and inline images. Articles are encrypted before storage with the organization key. Every change stays ..." |
*
* @param {Demo_Narrative_Topic_Library_Editor_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_editor_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Editor_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Editor_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_library_editor_body(inputs)
	return es_demo_narrative_topic_library_editor_body(inputs)
});