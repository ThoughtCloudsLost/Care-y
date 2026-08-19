/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Ticket_Detail_DescInputs */

const en_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The ticket detail view is where volunteers read messages, reply, take notes, and manage a case. Every field shown here was decrypted locally by the volunteer's browser. The server stores and relays ciphertext without access to the content. The view has two modes. A conversation thread for reading and replying, and a timeline for reviewing the full history of the case.`)
};

const es_demo_section_ticket_detail_desc = /** @type {(inputs: Demo_Section_Ticket_Detail_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La vista de detalle del ticket es donde los voluntarios leen mensajes, responden, toman notas y gestionan un caso. Cada campo mostrado aquí fue descifrado localmente por el navegador del voluntario. El servidor almacena y retransmite texto cifrado sin acceso al contenido. La vista tiene dos modos. Un hilo de conversación para leer y responder, y una línea de tiempo para revisar el historial completo del caso.`)
};

/**
* | output |
* | --- |
* | "The ticket detail view is where volunteers read messages, reply, take notes, and manage a case. Every field shown here was decrypted locally by the volunteer..." |
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