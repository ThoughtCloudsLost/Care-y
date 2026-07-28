/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Library_DescInputs */

const en_demo_section_library_desc = /** @type {(inputs: Demo_Section_Library_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The library is a shared knowledge base for the organization. Browse articles, read detailed entries with attachments and votes, and write new content in the rich-text editor. Everything here runs against the real in-browser server with real encryption.`)
};

const es_demo_section_library_desc = /** @type {(inputs: Demo_Section_Library_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La biblioteca es una base de conocimiento compartida para la organizacion. Navega articulos, lee entradas detalladas con adjuntos y votos, y escribe nuevo contenido en el editor de texto enriquecido. Todo aqui se ejecuta contra el servidor real en el navegador con cifrado real.`)
};

/**
* | output |
* | --- |
* | "The library is a shared knowledge base for the organization. Browse articles, read detailed entries with attachments and votes, and write new content in the ..." |
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