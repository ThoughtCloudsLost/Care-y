/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Followup_Type_Assignment_Change_DescInputs */

const en_followup_type_assignment_change_desc = /** @type {(inputs: Followup_Type_Assignment_Change_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} assigned, taken, or released`)
};

const es_followup_type_assignment_change_desc = /** @type {(inputs: Followup_Type_Assignment_Change_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} asignado, tomado o liberado`)
};

/**
* | output |
* | --- |
* | "{Ticket} assigned, taken, or released" |
*
* @param {Followup_Type_Assignment_Change_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_assignment_change_desc = /** @type {((inputs: Followup_Type_Assignment_Change_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Followup_Type_Assignment_Change_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_followup_type_assignment_change_desc(inputs)
	return es_followup_type_assignment_change_desc(inputs)
});