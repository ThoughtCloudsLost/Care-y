/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_BodyInputs */

const en_demo_narrative_search_body = /** @type {(inputs: Demo_Narrative_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search works entirely in the browser. Your device decrypts ticket content locally and matches your query against the plaintext. No search terms are ever sent to the server.`)
};

const es_demo_narrative_search_body = /** @type {(inputs: Demo_Narrative_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La busqueda funciona completamente en el navegador. Tu dispositivo descifra el contenido de los tickets localmente y compara tu consulta con el texto descifrado. Ningun termino de busqueda se envia al servidor.`)
};

/**
* | output |
* | --- |
* | "Search works entirely in the browser. Your device decrypts ticket content locally and matches your query against the plaintext. No search terms are ever sent..." |
*
* @param {Demo_Narrative_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_body = /** @type {((inputs?: Demo_Narrative_Search_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_search_body(inputs)
	return es_demo_narrative_search_body(inputs)
});