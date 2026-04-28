/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_PhoneInputs */

const en_ticket_new_field_phone = /** @type {(inputs: Ticket_New_Field_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone number`)
};

const es_ticket_new_field_phone = /** @type {(inputs: Ticket_New_Field_PhoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numero de telefono`)
};

/**
* | output |
* | --- |
* | "Phone number" |
*
* @param {Ticket_New_Field_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_phone = /** @type {((inputs?: Ticket_New_Field_PhoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_PhoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_field_phone(inputs)
	return es_ticket_new_field_phone(inputs)
});