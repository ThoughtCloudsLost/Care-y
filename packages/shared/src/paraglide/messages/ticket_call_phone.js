/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Call_PhoneInputs */

const en_ticket_call_phone = /** @type {(inputs: Ticket_Call_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call to my phone`)
};

const es_ticket_call_phone = /** @type {(inputs: Ticket_Call_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamar a mi teléfono`)
};

const en_xa2_ticket_call_phone = /** @type {(inputs: Ticket_Call_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll tò my phònè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Call to my phone" |
*
* @param {Ticket_Call_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_call_phone = /** @type {((inputs?: Ticket_Call_PhoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Call_PhoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_call_phone(inputs)
	if (locale === "en-XA") return en_xa2_ticket_call_phone(inputs)
	return en_ticket_call_phone(inputs)
});