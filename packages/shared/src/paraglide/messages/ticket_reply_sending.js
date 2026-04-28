/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Reply_SendingInputs */

const en_ticket_reply_sending = /** @type {(inputs: Ticket_Reply_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sending...`)
};

const es_ticket_reply_sending = /** @type {(inputs: Ticket_Reply_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviando...`)
};

/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Ticket_Reply_SendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sending = /** @type {((inputs?: Ticket_Reply_SendingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_SendingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_reply_sending(inputs)
	return es_ticket_reply_sending(inputs)
});