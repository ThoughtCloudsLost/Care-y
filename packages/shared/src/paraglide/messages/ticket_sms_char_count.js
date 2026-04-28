/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Sms_Char_CountInputs */

const en_ticket_sms_char_count = /** @type {(inputs: Ticket_Sms_Char_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} / 1600`)
};

const es_ticket_sms_char_count = /** @type {(inputs: Ticket_Sms_Char_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} / 1600`)
};

/**
* | output |
* | --- |
* | "{count} / 1600" |
*
* @param {Ticket_Sms_Char_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_char_count = /** @type {((inputs: Ticket_Sms_Char_CountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sms_Char_CountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_sms_char_count(inputs)
	return es_ticket_sms_char_count(inputs)
});