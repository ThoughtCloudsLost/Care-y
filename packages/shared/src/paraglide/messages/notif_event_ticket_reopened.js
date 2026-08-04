/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_Ticket_ReopenedInputs */

const en_notif_event_ticket_reopened = /** @type {(inputs: Notif_Event_Ticket_ReopenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reopened`)
};

const es_notif_event_ticket_reopened = /** @type {(inputs: Notif_Event_Ticket_ReopenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reabierto`)
};

/**
* | output |
* | --- |
* | "Reopened" |
*
* @param {Notif_Event_Ticket_ReopenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_reopened = /** @type {((inputs?: Notif_Event_Ticket_ReopenedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Ticket_ReopenedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_event_ticket_reopened(inputs)
	return es_notif_event_ticket_reopened(inputs)
});