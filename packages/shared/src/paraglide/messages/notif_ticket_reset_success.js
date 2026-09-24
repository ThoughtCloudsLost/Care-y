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

const en_xa2_notif_ticket_reset_success = /** @type {(inputs: Notif_Ticket_Reset_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèt nòtìfìcàtìòns rèsèt tò dèfàùlts ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Ticket notifications reset to defaults" |
*
* @param {Notif_Ticket_Reset_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_reset_success = /** @type {((inputs?: Notif_Ticket_Reset_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Ticket_Reset_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_ticket_reset_success(inputs)
	if (locale === "en-XA") return en_xa2_notif_ticket_reset_success(inputs)
	return en_notif_ticket_reset_success(inputs)
});