/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Email_Too_LongInputs */

const en_ticket_email_too_long = /** @type {(inputs: Ticket_Email_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Message is too long to send.`)
};

const es_ticket_email_too_long = /** @type {(inputs: Ticket_Email_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El mensaje es demasiado largo para enviar.`)
};

/**
* | output |
* | --- |
* | "Message is too long to send." |
*
* @param {Ticket_Email_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_too_long = /** @type {((inputs?: Ticket_Email_Too_LongInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Too_LongInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_email_too_long(inputs)
	return es_ticket_email_too_long(inputs)
});