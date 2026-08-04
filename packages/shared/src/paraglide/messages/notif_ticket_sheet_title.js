/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Notif_Ticket_Sheet_TitleInputs */

const en_notif_ticket_sheet_title = /** @type {(inputs: Notif_Ticket_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Notifications for this ${i?.ticket}`)
};

const es_notif_ticket_sheet_title = /** @type {(inputs: Notif_Ticket_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Notificaciones para este ${i?.ticket}`)
};

/**
* | output |
* | --- |
* | "Notifications for this {ticket}" |
*
* @param {Notif_Ticket_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_sheet_title = /** @type {((inputs: Notif_Ticket_Sheet_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Ticket_Sheet_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_ticket_sheet_title(inputs)
	return es_notif_ticket_sheet_title(inputs)
});