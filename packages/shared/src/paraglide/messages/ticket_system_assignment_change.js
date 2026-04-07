/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Ticket_System_Assignment_ChangeInputs */

const en_ticket_system_assignment_change = /** @type {(inputs: Ticket_System_Assignment_ChangeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Assigned to ${i?.name}`)
};

const es_ticket_system_assignment_change = /** @type {(inputs: Ticket_System_Assignment_ChangeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Asignado a ${i?.name}`)
};

/**
* | output |
* | --- |
* | "Assigned to {name}" |
*
* @param {Ticket_System_Assignment_ChangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_assignment_change = /** @type {((inputs: Ticket_System_Assignment_ChangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Assignment_ChangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_assignment_change(inputs)
	return es_ticket_system_assignment_change(inputs)
});