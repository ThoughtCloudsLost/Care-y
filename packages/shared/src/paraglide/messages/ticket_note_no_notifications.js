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

const en_xa2_ticket_note_no_notifications = /** @type {(inputs: Ticket_Note_No_NotificationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò nòtìfìcàtìòns •••••⟧`)
};

/**
* | output |
* | --- |
* | "No notifications" |
*
* @param {Ticket_Note_No_NotificationsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_no_notifications = /** @type {((inputs?: Ticket_Note_No_NotificationsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_No_NotificationsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_note_no_notifications(inputs)
	if (locale === "en-XA") return en_xa2_ticket_note_no_notifications(inputs)
	return en_ticket_note_no_notifications(inputs)
});