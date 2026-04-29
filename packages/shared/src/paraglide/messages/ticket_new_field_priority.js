/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_PriorityInputs */

const en_ticket_new_field_priority = /** @type {(inputs: Ticket_New_Field_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority`)
};

const es_ticket_new_field_priority = /** @type {(inputs: Ticket_New_Field_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Prioridad`)
};

/**
* | output |
* | --- |
* | "Priority" |
*
* @param {Ticket_New_Field_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_priority = /** @type {((inputs?: Ticket_New_Field_PriorityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_PriorityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_field_priority(inputs)
	return es_ticket_new_field_priority(inputs)
});