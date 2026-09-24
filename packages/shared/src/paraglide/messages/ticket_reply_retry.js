/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Reply_RetryInputs */

const en_ticket_reply_retry = /** @type {(inputs: Ticket_Reply_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retry`)
};

const es_ticket_reply_retry = /** @type {(inputs: Ticket_Reply_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reintentar`)
};

const en_xa2_ticket_reply_retry = /** @type {(inputs: Ticket_Reply_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètry ••⟧`)
};

/**
* | output |
* | --- |
* | "Retry" |
*
* @param {Ticket_Reply_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_retry = /** @type {((inputs?: Ticket_Reply_RetryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_RetryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_reply_retry(inputs)
	if (locale === "en-XA") return en_xa2_ticket_reply_retry(inputs)
	return en_ticket_reply_retry(inputs)
});