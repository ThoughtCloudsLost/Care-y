/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_AliasInputs */

const en_ticket_new_field_alias = /** @type {(inputs: Ticket_New_Field_AliasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alias (optional)`)
};

const es_ticket_new_field_alias = /** @type {(inputs: Ticket_New_Field_AliasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alias (opcional)`)
};

const en_xa2_ticket_new_field_alias = /** @type {(inputs: Ticket_New_Field_AliasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àlìàs (òptìònàl) •••••⟧`)
};

/**
* | output |
* | --- |
* | "Alias (optional)" |
*
* @param {Ticket_New_Field_AliasInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_alias = /** @type {((inputs?: Ticket_New_Field_AliasInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_AliasInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_field_alias(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_field_alias(inputs)
	return en_ticket_new_field_alias(inputs)
});