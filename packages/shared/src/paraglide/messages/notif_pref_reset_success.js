/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Pref_Reset_SuccessInputs */

const en_notif_pref_reset_success = /** @type {(inputs: Notif_Pref_Reset_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preferences reset to defaults`)
};

const es_notif_pref_reset_success = /** @type {(inputs: Notif_Pref_Reset_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preferencias restablecidas`)
};

/**
* | output |
* | --- |
* | "Preferences reset to defaults" |
*
* @param {Notif_Pref_Reset_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_pref_reset_success = /** @type {((inputs?: Notif_Pref_Reset_SuccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Pref_Reset_SuccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_pref_reset_success(inputs)
	return es_notif_pref_reset_success(inputs)
});