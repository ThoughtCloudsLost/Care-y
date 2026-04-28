/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ seconds: NonNullable<unknown> }} Ticket_Sms_Rate_LimitedInputs */

const en_ticket_sms_rate_limited = /** @type {(inputs: Ticket_Sms_Rate_LimitedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Too many messages. Try again in ${i?.seconds} seconds.`)
};

const es_ticket_sms_rate_limited = /** @type {(inputs: Ticket_Sms_Rate_LimitedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Demasiados mensajes. Intenta de nuevo en ${i?.seconds} segundos.`)
};

/**
* | output |
* | --- |
* | "Too many messages. Try again in {seconds} seconds." |
*
* @param {Ticket_Sms_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_rate_limited = /** @type {((inputs: Ticket_Sms_Rate_LimitedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sms_Rate_LimitedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_sms_rate_limited(inputs)
	return es_ticket_sms_rate_limited(inputs)
});