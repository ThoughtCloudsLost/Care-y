/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Call_PhoneInputs */

const en_ticket_call_phone = /** @type {(inputs: Ticket_Call_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call to my phone`)
};

const es_ticket_call_phone = /** @type {(inputs: Ticket_Call_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamar a mi telefono`)
};

/**
* | output |
* | --- |
* | "Call to my phone" |
*
* @param {Ticket_Call_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_call_phone = /** @type {((inputs?: Ticket_Call_PhoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Call_PhoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_call_phone(inputs)
	return es_ticket_call_phone(inputs)
});