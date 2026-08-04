/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Ticket_ResetInputs */

const en_notif_ticket_reset = /** @type {(inputs: Notif_Ticket_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset to my defaults`)
};

const es_notif_ticket_reset = /** @type {(inputs: Notif_Ticket_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restablecer a mis valores predeterminados`)
};

/**
* | output |
* | --- |
* | "Reset to my defaults" |
*
* @param {Notif_Ticket_ResetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_reset = /** @type {((inputs?: Notif_Ticket_ResetInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Ticket_ResetInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_ticket_reset(inputs)
	return es_notif_ticket_reset(inputs)
});