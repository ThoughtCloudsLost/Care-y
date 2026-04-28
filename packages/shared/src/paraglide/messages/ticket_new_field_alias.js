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

/**
* | output |
* | --- |
* | "Alias (optional)" |
*
* @param {Ticket_New_Field_AliasInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_alias = /** @type {((inputs?: Ticket_New_Field_AliasInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_AliasInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_field_alias(inputs)
	return es_ticket_new_field_alias(inputs)
});