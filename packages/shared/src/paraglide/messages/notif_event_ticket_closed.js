/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_Ticket_ClosedInputs */

const en_notif_event_ticket_closed = /** @type {(inputs: Notif_Event_Ticket_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closed`)
};

const es_notif_event_ticket_closed = /** @type {(inputs: Notif_Event_Ticket_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrado`)
};

/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Notif_Event_Ticket_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_closed = /** @type {((inputs?: Notif_Event_Ticket_ClosedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Ticket_ClosedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_event_ticket_closed(inputs)
	return es_notif_event_ticket_closed(inputs)
});