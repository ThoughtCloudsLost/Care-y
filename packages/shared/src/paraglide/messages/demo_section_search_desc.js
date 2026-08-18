/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Search_DescInputs */

const en_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search finds results across tickets, knowledge base articles, and volunteers from a single interface. All text matching happens in the browser against decrypted content. No search terms are sent to the server.`)
};

const es_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La busqueda encuentra resultados en tickets, articulos de la base de conocimiento y voluntarios desde una unica interfaz. Toda la comparacion de texto ocurre en el navegador contra contenido descifrado. Ningun termino de busqueda se envia al servidor.`)
};

/**
* | output |
* | --- |
* | "Search finds results across tickets, knowledge base articles, and volunteers from a single interface. All text matching happens in the browser against decryp..." |
*
* @param {Demo_Section_Search_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_search_desc = /** @type {((inputs?: Demo_Section_Search_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Search_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_search_desc(inputs)
	return es_demo_section_search_desc(inputs)
});