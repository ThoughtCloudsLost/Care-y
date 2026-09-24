/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Sms_SendingInputs */

const en_ticket_sms_sending = /** @type {(inputs: Ticket_Sms_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sending...`)
};

const es_ticket_sms_sending = /** @type {(inputs: Ticket_Sms_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviando...`)
};

const en_xa2_ticket_sms_sending = /** @type {(inputs: Ticket_Sms_SendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèndìng... •••⟧`)
};

/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Ticket_Sms_SendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_sending = /** @type {((inputs?: Ticket_Sms_SendingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sms_SendingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_sms_sending(inputs)
	if (locale === "en-XA") return en_xa2_ticket_sms_sending(inputs)
	return en_ticket_sms_sending(inputs)
});