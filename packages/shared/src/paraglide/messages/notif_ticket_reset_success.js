/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Ticket_Reset_SuccessInputs */

const en_notif_ticket_reset_success = /** @type {(inputs: Notif_Ticket_Reset_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket notifications reset to defaults`)
};

const es_notif_ticket_reset_success = /** @type {(inputs: Notif_Ticket_Reset_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notificaciones del ticket restablecidas`)
};

/**
* | output |
* | --- |
* | "Ticket notifications reset to defaults" |
*
* @param {Notif_Ticket_Reset_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_reset_success = /** @type {((inputs?: Notif_Ticket_Reset_SuccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Ticket_Reset_SuccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_ticket_reset_success(inputs)
	return es_notif_ticket_reset_success(inputs)
});