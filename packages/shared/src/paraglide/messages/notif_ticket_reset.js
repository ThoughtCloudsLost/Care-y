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

const en_xa2_notif_ticket_reset = /** @type {(inputs: Notif_Ticket_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsèt tò my dèfàùlts ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reset to my defaults" |
*
* @param {Notif_Ticket_ResetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_reset = /** @type {((inputs?: Notif_Ticket_ResetInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Ticket_ResetInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_ticket_reset(inputs)
	if (locale === "en-XA") return en_xa2_notif_ticket_reset(inputs)
	return en_notif_ticket_reset(inputs)
});