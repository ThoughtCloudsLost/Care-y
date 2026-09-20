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

const en_xa2_notif_ticket_panel_action = /** @type {(inputs: Notif_Ticket_Panel_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtìfìcàtìòn chànnèls •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Notification channels" |
*
* @param {Notif_Ticket_Panel_ActionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_panel_action = /** @type {((inputs?: Notif_Ticket_Panel_ActionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Ticket_Panel_ActionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_ticket_panel_action(inputs)
	if (locale === "en-XA") return en_xa2_notif_ticket_panel_action(inputs)
	return en_notif_ticket_panel_action(inputs)
});