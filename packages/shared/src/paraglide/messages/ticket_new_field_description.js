/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_DescriptionInputs */

const en_ticket_new_field_description = /** @type {(inputs: Ticket_New_Field_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Description`)
};

const es_ticket_new_field_description = /** @type {(inputs: Ticket_New_Field_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descripción`)
};

const en_xa2_ticket_new_field_description = /** @type {(inputs: Ticket_New_Field_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèscrìptìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Description" |
*
* @param {Ticket_New_Field_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_description = /** @type {((inputs?: Ticket_New_Field_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_field_description(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_field_description(inputs)
	return en_ticket_new_field_description(inputs)
});