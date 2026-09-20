/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Mode_ReplyInputs */

const en_ticket_mode_reply = /** @type {(inputs: Ticket_Mode_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`REPLY`)
};

const es_ticket_mode_reply = /** @type {(inputs: Ticket_Mode_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`RESPUESTA`)
};

const en_xa2_ticket_mode_reply = /** @type {(inputs: Ticket_Mode_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦RÈPLY ••⟧`)
};

/**
* | output |
* | --- |
* | "REPLY" |
*
* @param {Ticket_Mode_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_mode_reply = /** @type {((inputs?: Ticket_Mode_ReplyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mode_ReplyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_mode_reply(inputs)
	if (locale === "en-XA") return en_xa2_ticket_mode_reply(inputs)
	return en_ticket_mode_reply(inputs)
});