/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_Alias_PlaceholderInputs */

const en_ticket_new_field_alias_placeholder = /** @type {(inputs: Ticket_New_Field_Alias_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How you'll refer to this client`)
};

const es_ticket_new_field_alias_placeholder = /** @type {(inputs: Ticket_New_Field_Alias_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Como te referiras a este cliente`)
};

/**
* | output |
* | --- |
* | "How you'll refer to this client" |
*
* @param {Ticket_New_Field_Alias_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_alias_placeholder = /** @type {((inputs?: Ticket_New_Field_Alias_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_Alias_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_field_alias_placeholder(inputs)
	return es_ticket_new_field_alias_placeholder(inputs)
});