/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Ticket_Pref_SavedInputs */

const en_notif_ticket_pref_saved = /** @type {(inputs: Notif_Ticket_Pref_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket preference saved`)
};

const es_notif_ticket_pref_saved = /** @type {(inputs: Notif_Ticket_Pref_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preferencia del ticket guardada`)
};

const en_xa2_notif_ticket_pref_saved = /** @type {(inputs: Notif_Ticket_Pref_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèt prèfèrèncè sàvèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Ticket preference saved" |
*
* @param {Notif_Ticket_Pref_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_ticket_pref_saved = /** @type {((inputs?: Notif_Ticket_Pref_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Ticket_Pref_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_ticket_pref_saved(inputs)
	if (locale === "en-XA") return en_xa2_notif_ticket_pref_saved(inputs)
	return en_notif_ticket_pref_saved(inputs)
});