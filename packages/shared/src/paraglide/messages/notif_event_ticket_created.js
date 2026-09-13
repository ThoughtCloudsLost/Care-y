/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Notif_Event_Ticket_CreatedInputs */

const en_notif_event_ticket_created = /** @type {(inputs: Notif_Event_Ticket_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`New ${i?.ticket}`)
};

const es_notif_event_ticket_created = /** @type {(inputs: Notif_Event_Ticket_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nuevo ${i?.ticket}`)
};

/**
* | output |
* | --- |
* | "New {ticket}" |
*
* @param {Notif_Event_Ticket_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_created = /** @type {((inputs: Notif_Event_Ticket_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Ticket_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_event_ticket_created(inputs)
	return es_notif_event_ticket_created(inputs)
});