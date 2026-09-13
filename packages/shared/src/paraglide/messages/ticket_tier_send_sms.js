/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Send_SmsInputs */

const en_ticket_tier_send_sms = /** @type {(inputs: Ticket_Tier_Send_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send by SMS`)
};

const es_ticket_tier_send_sms = /** @type {(inputs: Ticket_Tier_Send_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar por SMS`)
};

/**
* | output |
* | --- |
* | "Send by SMS" |
*
* @param {Ticket_Tier_Send_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_send_sms = /** @type {((inputs?: Ticket_Tier_Send_SmsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Send_SmsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_send_sms(inputs)
	return es_ticket_tier_send_sms(inputs)
});