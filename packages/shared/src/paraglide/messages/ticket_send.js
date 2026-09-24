/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_SendInputs */

const en_ticket_send = /** @type {(inputs: Ticket_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send message`)
};

const es_ticket_send = /** @type {(inputs: Ticket_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar mensaje`)
};

const en_xa2_ticket_send = /** @type {(inputs: Ticket_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd mèssàgè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Send message" |
*
* @param {Ticket_SendInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_send = /** @type {((inputs?: Ticket_SendInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_SendInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_send(inputs)
	if (locale === "en-XA") return en_xa2_ticket_send(inputs)
	return en_ticket_send(inputs)
});