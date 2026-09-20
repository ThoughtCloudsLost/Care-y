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

const en_xa2_ticket_system_volunteer_unassigned = /** @type {(inputs: Ticket_System_Volunteer_UnassignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.name} ùnàssìgnèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "{name} unassigned" |
*
* @param {Ticket_System_Volunteer_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_volunteer_unassigned = /** @type {((inputs: Ticket_System_Volunteer_UnassignedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Volunteer_UnassignedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_system_volunteer_unassigned(inputs)
	if (locale === "en-XA") return en_xa2_ticket_system_volunteer_unassigned(inputs)
	return en_ticket_system_volunteer_unassigned(inputs)
});