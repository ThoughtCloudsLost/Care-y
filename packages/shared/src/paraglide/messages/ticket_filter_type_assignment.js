/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_AssignmentInputs */

const en_ticket_filter_type_assignment = /** @type {(inputs: Ticket_Filter_Type_AssignmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assignments`)
};

const es_ticket_filter_type_assignment = /** @type {(inputs: Ticket_Filter_Type_AssignmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignaciones`)
};

/**
* | output |
* | --- |
* | "Assignments" |
*
* @param {Ticket_Filter_Type_AssignmentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_assignment = /** @type {((inputs?: Ticket_Filter_Type_AssignmentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_AssignmentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_filter_type_assignment(inputs)
	return es_ticket_filter_type_assignment(inputs)
});