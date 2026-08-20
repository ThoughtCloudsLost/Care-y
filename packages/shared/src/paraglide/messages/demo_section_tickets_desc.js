/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Tickets_DescInputs */

const en_demo_section_tickets_desc = /** @type {(inputs: Demo_Section_Tickets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The ticket list is where volunteers manage incoming cases. Every ticket title, description, and message is encrypted with keys only the browser holds. The server stores ciphertext and routes it without reading it. Volunteers sort, filter, and search tickets locally after their browser decrypts the content.`)
};

const es_demo_section_tickets_desc = /** @type {(inputs: Demo_Section_Tickets_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La lista de tickets es donde los voluntarios gestionan los casos entrantes. Cada título, descripción y mensaje de ticket está cifrado con claves que solo el navegador posee. El servidor almacena texto cifrado y lo transmite sin leerlo. Los voluntarios ordenan, filtran y buscan tickets localmente después de que su navegador descifra el contenido.`)
};

/**
* | output |
* | --- |
* | "The ticket list is where volunteers manage incoming cases. Every ticket title, description, and message is encrypted with keys only the browser holds. The se..." |
*
* @param {Demo_Section_Tickets_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_tickets_desc = /** @type {((inputs?: Demo_Section_Tickets_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Tickets_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_tickets_desc(inputs)
	return es_demo_section_tickets_desc(inputs)
});