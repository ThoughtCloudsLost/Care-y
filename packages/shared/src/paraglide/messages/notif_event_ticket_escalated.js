/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Event_Ticket_EscalatedInputs */

const en_notif_event_ticket_escalated = /** @type {(inputs: Notif_Event_Ticket_EscalatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalated`)
};

const es_notif_event_ticket_escalated = /** @type {(inputs: Notif_Event_Ticket_EscalatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escalado`)
};

/**
* | output |
* | --- |
* | "Escalated" |
*
* @param {Notif_Event_Ticket_EscalatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_escalated = /** @type {((inputs?: Notif_Event_Ticket_EscalatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Event_Ticket_EscalatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_event_ticket_escalated(inputs)
	return es_notif_event_ticket_escalated(inputs)
});