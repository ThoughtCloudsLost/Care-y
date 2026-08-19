/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Library_DescInputs */

const en_demo_section_library_desc = /** @type {(inputs: Demo_Section_Library_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The library is a shared knowledge base for the organization. Volunteers browse articles, read detailed entries with attachments and votes, and write new content in the rich text editor. Article titles and bodies are encrypted with the organization key before storage.`)
};

const es_demo_section_library_desc = /** @type {(inputs: Demo_Section_Library_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La biblioteca es una base de conocimiento compartida para la organización. Los voluntarios navegan artículos, leen entradas detalladas con adjuntos y votos, y escriben nuevo contenido en el editor de texto enriquecido. Los títulos y cuerpos de los artículos se cifran con la clave de la organización antes de almacenarse.`)
};

/**
* | output |
* | --- |
* | "The library is a shared knowledge base for the organization. Volunteers browse articles, read detailed entries with attachments and votes, and write new cont..." |
*
* @param {Demo_Section_Library_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_library_desc = /** @type {((inputs?: Demo_Section_Library_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Library_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_library_desc(inputs)
	return es_demo_section_library_desc(inputs)
});