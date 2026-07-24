/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_Mode_Indicator_SmsInputs */

const en_ticket_mode_indicator_sms = /** @type {(inputs: Ticket_Mode_Indicator_SmsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`texting ${i?.client} via SMS`)
};

const es_ticket_mode_indicator_sms = /** @type {(inputs: Ticket_Mode_Indicator_SmsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`enviando SMS al ${i?.client}`)
};

/**
* | output |
* | --- |
* | "texting {client} via SMS" |
*
* @param {Ticket_Mode_Indicator_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mode_indicator_sms = /** @type {((inputs: Ticket_Mode_Indicator_SmsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mode_Indicator_SmsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_mode_indicator_sms(inputs)
	return es_ticket_mode_indicator_sms(inputs)
});