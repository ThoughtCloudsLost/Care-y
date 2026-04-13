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

/**
* | output |
* | --- |
* | "Send message" |
*
* @param {Ticket_SendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_send = /** @type {((inputs?: Ticket_SendInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_SendInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_send(inputs)
	return es_ticket_send(inputs)
});