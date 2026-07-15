/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown>, client: NonNullable<unknown> }} Ticket_Reply_To_ClientInputs */

const en_ticket_reply_to_client = /** @type {(inputs: Ticket_Reply_To_ClientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reply to ${i?.Client}`)
};

const es_ticket_reply_to_client = /** @type {(inputs: Ticket_Reply_To_ClientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Responder al ${i?.client}`)
};

/**
* | output |
* | --- |
* | "Reply to {Client}" |
*
* @param {Ticket_Reply_To_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_to_client = /** @type {((inputs: Ticket_Reply_To_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_To_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_reply_to_client(inputs)
	return es_ticket_reply_to_client(inputs)
});