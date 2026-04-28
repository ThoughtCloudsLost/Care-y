/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_Phone_PlaceholderInputs */

const en_ticket_new_field_phone_placeholder = /** @type {(inputs: Ticket_New_Field_Phone_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+1 (555) 123-4567`)
};

const es_ticket_new_field_phone_placeholder = /** @type {(inputs: Ticket_New_Field_Phone_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+1 (555) 123-4567`)
};

/**
* | output |
* | --- |
* | "+1 (555) 123-4567" |
*
* @param {Ticket_New_Field_Phone_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_phone_placeholder = /** @type {((inputs?: Ticket_New_Field_Phone_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_Phone_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_field_phone_placeholder(inputs)
	return es_ticket_new_field_phone_placeholder(inputs)
});