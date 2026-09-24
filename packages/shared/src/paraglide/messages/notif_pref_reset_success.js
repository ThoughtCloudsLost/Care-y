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

const en_xa2_notif_pref_reset_success = /** @type {(inputs: Notif_Pref_Reset_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prèfèrèncès rèsèt tò dèfàùlts •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Preferences reset to defaults" |
*
* @param {Notif_Pref_Reset_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_pref_reset_success = /** @type {((inputs?: Notif_Pref_Reset_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Pref_Reset_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_pref_reset_success(inputs)
	if (locale === "en-XA") return en_xa2_notif_pref_reset_success(inputs)
	return en_notif_pref_reset_success(inputs)
});