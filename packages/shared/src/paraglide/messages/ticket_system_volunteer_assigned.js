/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Ticket_System_Volunteer_AssignedInputs */

const en_ticket_system_volunteer_assigned = /** @type {(inputs: Ticket_System_Volunteer_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.name} assigned`)
};

const es_ticket_system_volunteer_assigned = /** @type {(inputs: Ticket_System_Volunteer_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.name} asignado`)
};

/**
* | output |
* | --- |
* | "{name} assigned" |
*
* @param {Ticket_System_Volunteer_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_volunteer_assigned = /** @type {((inputs: Ticket_System_Volunteer_AssignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Volunteer_AssignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_volunteer_assigned(inputs)
	return es_ticket_system_volunteer_assigned(inputs)
});