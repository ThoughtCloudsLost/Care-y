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

const en_xa2_notif_event_ticket_assigned = /** @type {(inputs: Notif_Event_Ticket_AssignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìgnèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Assigned" |
*
* @param {Notif_Event_Ticket_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_assigned = /** @type {((inputs?: Notif_Event_Ticket_AssignedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Ticket_AssignedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_event_ticket_assigned(inputs)
	if (locale === "en-XA") return en_xa2_notif_event_ticket_assigned(inputs)
	return en_notif_event_ticket_assigned(inputs)
});