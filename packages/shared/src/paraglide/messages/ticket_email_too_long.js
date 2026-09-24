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

const en_xa2_ticket_email_too_long = /** @type {(inputs: Ticket_Email_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgè ìs tòò lòng tò sènd. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Message is too long to send." |
*
* @param {Ticket_Email_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_too_long = /** @type {((inputs?: Ticket_Email_Too_LongInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Too_LongInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_too_long(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_too_long(inputs)
	return en_ticket_email_too_long(inputs)
});