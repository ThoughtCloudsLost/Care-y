/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Search_DescInputs */

const en_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search operates entirely in the browser. Your device decrypts ticket content locally and matches your query against the plaintext. No search terms leave the device.`)
};

const es_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La busqueda funciona completamente en el navegador. Tu dispositivo descifra el contenido de los tickets localmente y compara tu consulta contra el texto descifrado. Ningun termino de busqueda sale del dispositivo.`)
};

/**
* | output |
* | --- |
* | "Search operates entirely in the browser. Your device decrypts ticket content locally and matches your query against the plaintext. No search terms leave the ..." |
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