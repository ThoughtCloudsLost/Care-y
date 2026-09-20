/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_Description_PlaceholderInputs */

const en_ticket_new_field_description_placeholder = /** @type {(inputs: Ticket_New_Field_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Details (optional)`)
};

const es_ticket_new_field_description_placeholder = /** @type {(inputs: Ticket_New_Field_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detalles (opcional)`)
};

const en_xa2_ticket_new_field_description_placeholder = /** @type {(inputs: Ticket_New_Field_Description_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dètàìls (òptìònàl) ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Details (optional)" |
*
* @param {Ticket_New_Field_Description_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_description_placeholder = /** @type {((inputs?: Ticket_New_Field_Description_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_Description_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_field_description_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_field_description_placeholder(inputs)
	return en_ticket_new_field_description_placeholder(inputs)
});