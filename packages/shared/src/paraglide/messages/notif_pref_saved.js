/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Pref_SavedInputs */

const en_notif_pref_saved = /** @type {(inputs: Notif_Pref_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preference saved`)
};

const es_notif_pref_saved = /** @type {(inputs: Notif_Pref_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preferencia guardada`)
};

/**
* | output |
* | --- |
* | "Preference saved" |
*
* @param {Notif_Pref_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_pref_saved = /** @type {((inputs?: Notif_Pref_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Pref_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_pref_saved(inputs)
	return es_notif_pref_saved(inputs)
});