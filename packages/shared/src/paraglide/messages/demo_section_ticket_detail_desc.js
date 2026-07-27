/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Ticket_Detail_DescInputs */

const en_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inside a ticket, volunteers read messages, reply, take notes, and review case metadata. Every field shown here was decrypted locally. The server relayed the ciphertext and learned nothing about its contents.`)
};

const es_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dentro de un ticket, los voluntarios leen mensajes, responden, toman notas y revisan los metadatos del caso. Cada campo mostrado aqui fue descifrado localmente. El servidor retransmitio el texto cifrado sin conocer su contenido.`)
};

/**
* | output |
* | --- |
* | "Inside a ticket, volunteers read messages, reply, take notes, and review case metadata. Every field shown here was decrypted locally. The server relayed the ..." |
*
* @param {Demo_Section_Ticket_Detail_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_ticket_detail_desc = /** @type {((inputs?: Demo_Section_Ticket_Detail_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Ticket_Detail_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_ticket_detail_desc(inputs)
	return es_demo_section_ticket_detail_desc(inputs)
});