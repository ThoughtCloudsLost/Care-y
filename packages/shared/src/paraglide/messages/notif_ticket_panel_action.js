/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Ticket_Panel_ActionInputs */

const en_notif_ticket_panel_action = /** @type {(inputs: Notif_Ticket_Panel_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notification channels`)
};

const es_notif_ticket_panel_action = /** @type {(inputs: Notif_Ticket_Panel_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Canales de notificación`)
};

/**
* | output |
* | --- |
* | "Notification channels" |
*
* @param {Notif_Ticket_Panel_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_panel_action = /** @type {((inputs?: Notif_Ticket_Panel_ActionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Ticket_Panel_ActionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_ticket_panel_action(inputs)
	return es_notif_ticket_panel_action(inputs)
});