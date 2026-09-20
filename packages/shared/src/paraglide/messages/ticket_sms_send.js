/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Sms_SendInputs */

const en_ticket_sms_send = /** @type {(inputs: Ticket_Sms_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send SMS`)
};

const es_ticket_sms_send = /** @type {(inputs: Ticket_Sms_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar SMS`)
};

const en_xa2_ticket_sms_send = /** @type {(inputs: Ticket_Sms_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd SMS •••⟧`)
};

/**
* | output |
* | --- |
* | "Send SMS" |
*
* @param {Ticket_Sms_SendInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_send = /** @type {((inputs?: Ticket_Sms_SendInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Sms_SendInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_sms_send(inputs)
	if (locale === "en-XA") return en_xa2_ticket_sms_send(inputs)
	return en_ticket_sms_send(inputs)
});