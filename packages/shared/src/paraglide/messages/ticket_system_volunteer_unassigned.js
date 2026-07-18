/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Ticket_System_Volunteer_UnassignedInputs */

const en_ticket_system_volunteer_unassigned = /** @type {(inputs: Ticket_System_Volunteer_UnassignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.name} unassigned`)
};

const es_ticket_system_volunteer_unassigned = /** @type {(inputs: Ticket_System_Volunteer_UnassignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.name} desasignado`)
};

/**
* | output |
* | --- |
* | "{name} unassigned" |
*
* @param {Ticket_System_Volunteer_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_system_volunteer_unassigned = /** @type {((inputs: Ticket_System_Volunteer_UnassignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Volunteer_UnassignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_system_volunteer_unassigned(inputs)
	return es_ticket_system_volunteer_unassigned(inputs)
});