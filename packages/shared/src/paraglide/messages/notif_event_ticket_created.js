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

const en_xa2_notif_event_ticket_created = /** @type {(inputs: Notif_Event_Ticket_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nèw  ••${i?.ticket}⟧`)
};

/**
* | output |
* | --- |
* | "New {ticket}" |
*
* @param {Notif_Event_Ticket_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_created = /** @type {((inputs: Notif_Event_Ticket_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Ticket_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_event_ticket_created(inputs)
	if (locale === "en-XA") return en_xa2_notif_event_ticket_created(inputs)
	return en_notif_event_ticket_created(inputs)
});