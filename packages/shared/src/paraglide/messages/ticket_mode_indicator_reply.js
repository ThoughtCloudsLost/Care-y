/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Mode_Indicator_ReplyInputs */

const en_ticket_mode_indicator_reply = /** @type {(inputs: Ticket_Mode_Indicator_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`replying via encrypted care-y portal`)
};

const es_ticket_mode_indicator_reply = /** @type {(inputs: Ticket_Mode_Indicator_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`respondiendo via portal cifrado care-y`)
};

/**
* | output |
* | --- |
* | "replying via encrypted care-y portal" |
*
* @param {Ticket_Mode_Indicator_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mode_indicator_reply = /** @type {((inputs?: Ticket_Mode_Indicator_ReplyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mode_Indicator_ReplyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_mode_indicator_reply(inputs)
	return es_ticket_mode_indicator_reply(inputs)
});