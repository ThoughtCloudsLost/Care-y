/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_New_Ticket_BodyInputs */

const en_demo_narrative_topic_new_ticket_body = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When you create a ticket, the title and description are encrypted in your browser before they leave the device. The server stores ciphertext and assigns a ticket ID without reading the content.`)
};

const es_demo_narrative_topic_new_ticket_body = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando creas un ticket, el titulo y la descripcion se cifran en tu navegador antes de salir del dispositivo. El servidor almacena texto cifrado y asigna un ID de ticket sin leer el contenido.`)
};

/**
* | output |
* | --- |
* | "When you create a ticket, the title and description are encrypted in your browser before they leave the device. The server stores ciphertext and assigns a ti..." |
*
* @param {Demo_Narrative_Topic_New_Ticket_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_new_ticket_body = /** @type {((inputs?: Demo_Narrative_Topic_New_Ticket_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_New_Ticket_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_new_ticket_body(inputs)
	return es_demo_narrative_topic_new_ticket_body(inputs)
});