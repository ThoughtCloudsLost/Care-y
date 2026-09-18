/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Library_DescInputs */

const en_demo_section_library_desc = /** @type {(inputs: Demo_Section_Library_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A shared knowledge base for the organization. Article titles and bodies are encrypted with the organization key before storage.`)
};

const es_demo_section_library_desc = /** @type {(inputs: Demo_Section_Library_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una base de conocimiento compartida para la organización. Los títulos y cuerpos de los artículos se cifran con la clave de la organización antes de almacenarse.`)
};

/**
* | output |
* | --- |
* | "A shared knowledge base for the organization. Article titles and bodies are encrypted with the organization key before storage." |
*
* @param {Demo_Section_Library_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_library_desc = /** @type {((inputs?: Demo_Section_Library_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Library_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_library_desc(inputs)
	return en_demo_section_library_desc(inputs)
});