/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Note_No_NotificationsInputs */

const en_ticket_note_no_notifications = /** @type {(inputs: Ticket_Note_No_NotificationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No notifications`)
};

const es_ticket_note_no_notifications = /** @type {(inputs: Ticket_Note_No_NotificationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin notificaciones`)
};

/**
* | output |
* | --- |
* | "No notifications" |
*
* @param {Ticket_Note_No_NotificationsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_no_notifications = /** @type {((inputs?: Ticket_Note_No_NotificationsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_No_NotificationsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_note_no_notifications(inputs)
	return es_ticket_note_no_notifications(inputs)
});