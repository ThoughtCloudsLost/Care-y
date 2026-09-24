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

const en_xa2_ticket_new_field_phone_placeholder = /** @type {(inputs: Ticket_New_Field_Phone_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦+1 (555) 123-4567 ••••••⟧`)
};

/**
* | output |
* | --- |
* | "+1 (555) 123-4567" |
*
* @param {Ticket_New_Field_Phone_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_phone_placeholder = /** @type {((inputs?: Ticket_New_Field_Phone_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_Phone_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_field_phone_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_field_phone_placeholder(inputs)
	return en_ticket_new_field_phone_placeholder(inputs)
});