/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Search_DescInputs */

const en_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Global search runs a single query against tickets and knowledge base articles from any page. Matching happens in the browser against content the browser has already decrypted; no search term leaves the device. The server answers requests for encrypted data it cannot read and never learns what was typed or which records matched. [How global search works](#search/how-it-works) explains how queries run without sending a word to the server and what traffic patterns remain visible.`)
};

const es_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La búsqueda global ejecuta una sola consulta contra tickets y artículos de la base de conocimiento desde cualquier página. La comparación ocurre en el navegador contra contenido que el navegador ya descifró; ningún término de búsqueda sale del dispositivo. El servidor responde con datos cifrados que no puede leer y nunca conoce lo que se escribió ni qué registros coincidieron. [Cómo funciona la búsqueda global](#search/how-it-works) explica cómo las consultas se ejecutan sin enviar una palabra al servidor y qué patrones de tráfico quedan visibles.`)
};

const en_xa2_demo_section_search_desc = /** @type {(inputs: Demo_Section_Search_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Glòbàl sèàrch rùns à sìnglè qùèry àgàìnst tìckèts ànd knòwlèdgè bàsè àrtìclès fròm àny pàgè. Màtchìng hàppèns ìn thè bròwsèr àgàìnst còntènt thè bròwsèr hàs àlrèàdy dècryptèd; nò sèàrch tèrm lèàvès thè dèvìcè. Thè sèrvèr ànswèrs rèqùèsts fòr èncryptèd dàtà ìt cànnòt rèàd ànd nèvèr lèàrns whàt wàs typèd òr whìch rècòrds màtchèd. [Hòw glòbàl sèàrch wòrks](#sèàrch/hòw-ìt-wòrks) èxplàìns hòw qùèrìès rùn wìthòùt sèndìng à wòrd tò thè sèrvèr ànd whàt tràffìc pàttèrns rèmàìn vìsìblè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Global search runs a single query against tickets and knowledge base articles from any page. Matching happens in the browser against content the browser has ..." |
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