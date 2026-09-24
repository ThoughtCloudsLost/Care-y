/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Search_DescInputs */

const en_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search finds results across tickets, knowledge base articles, and volunteers from a single interface. All text matching happens in the browser against decrypted content. No search terms are sent to the server.`)
};

const es_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La búsqueda encuentra resultados en tickets, artículos de la base de conocimiento y voluntarios desde una única interfaz. Toda la comparación de texto ocurre en el navegador contra contenido descifrado. Ningún término de búsqueda se envía al servidor.`)
};

const en_xa2_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch fìnds rèsùlts àcròss tìckèts, knòwlèdgè bàsè àrtìclès, ànd vòlùntèèrs fròm à sìnglè ìntèrfàcè. Àll tèxt màtchìng hàppèns ìn thè bròwsèr àgàìnst dècryptèd còntènt. Nò sèàrch tèrms àrè sènt tò thè sèrvèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Search finds results across tickets, knowledge base articles, and volunteers from a single interface. All text matching happens in the browser against decryp..." |
*
* @param {Demo_Section_Search_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_search_desc = /** @type {((inputs?: Demo_Section_Search_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Search_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_search_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_search_desc(inputs)
	return en_demo_section_search_desc(inputs)
});