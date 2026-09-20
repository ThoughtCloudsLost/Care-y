/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Tickets_DescInputs */

const en_demo_section_tickets_desc = /** @type {(inputs: Demo_Section_Tickets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every ticket title, description, and message is encrypted with keys only the browser holds. The server stores ciphertext and routes it without reading it. Sorting, filtering, and searching all happen locally after the browser decrypts the content.`)
};

const es_demo_section_tickets_desc = /** @type {(inputs: Demo_Section_Tickets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada título, descripción y mensaje de ticket está cifrado con claves que solo el navegador posee. El servidor almacena texto cifrado y lo transmite sin leerlo. La ordenación, el filtrado y la búsqueda ocurren localmente después de que el navegador descifra el contenido.`)
};

const en_xa2_demo_section_tickets_desc = /** @type {(inputs: Demo_Section_Tickets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èvèry tìckèt tìtlè, dèscrìptìòn, ànd mèssàgè ìs èncryptèd wìth kèys ònly thè bròwsèr hòlds. Thè sèrvèr stòrès cìphèrtèxt ànd ròùtès ìt wìthòùt rèàdìng ìt. Sòrtìng, fìltèrìng, ànd sèàrchìng àll hàppèn lòcàlly àftèr thè bròwsèr dècrypts thè còntènt. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Every ticket title, description, and message is encrypted with keys only the browser holds. The server stores ciphertext and routes it without reading it. So..." |
*
* @param {Demo_Section_Tickets_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_tickets_desc = /** @type {((inputs?: Demo_Section_Tickets_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Tickets_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_tickets_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_tickets_desc(inputs)
	return en_demo_section_tickets_desc(inputs)
});