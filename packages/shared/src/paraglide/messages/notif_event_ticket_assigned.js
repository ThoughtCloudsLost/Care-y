/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_Ticket_AssignedInputs */

const en_notif_event_ticket_assigned = /** @type {(inputs: Notif_Event_Ticket_AssignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assigned`)
};

const es_notif_event_ticket_assigned = /** @type {(inputs: Notif_Event_Ticket_AssignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignado`)
};

/**
* | output |
* | --- |
* | "Assigned" |
*
* @param {Notif_Event_Ticket_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_assigned = /** @type {((inputs?: Notif_Event_Ticket_AssignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Ticket_AssignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_event_ticket_assigned(inputs)
	return es_notif_event_ticket_assigned(inputs)
});