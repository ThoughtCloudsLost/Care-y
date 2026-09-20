/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_New_Field_Alias_PlaceholderInputs */

const en_ticket_new_field_alias_placeholder = /** @type {(inputs: Ticket_New_Field_Alias_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`How you'll refer to this ${i?.client}`)
};

const es_ticket_new_field_alias_placeholder = /** @type {(inputs: Ticket_New_Field_Alias_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cómo te referirás a este ${i?.client}`)
};

const en_xa2_ticket_new_field_alias_placeholder = /** @type {(inputs: Ticket_New_Field_Alias_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Hòw yòù'll rèfèr tò thìs  ••••••••${i?.client}⟧`)
};

/**
* | output |
* | --- |
* | "How you'll refer to this {client}" |
*
* @param {Ticket_New_Field_Alias_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_alias_placeholder = /** @type {((inputs: Ticket_New_Field_Alias_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_Alias_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_field_alias_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_field_alias_placeholder(inputs)
	return en_ticket_new_field_alias_placeholder(inputs)
});