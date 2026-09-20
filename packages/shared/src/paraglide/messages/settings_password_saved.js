/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_SavedInputs */

const en_settings_password_saved = /** @type {(inputs: Settings_Password_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password changed`)
};

const es_settings_password_saved = /** @type {(inputs: Settings_Password_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña cambiada`)
};

const en_xa2_settings_password_saved = /** @type {(inputs: Settings_Password_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrd chàngèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Password changed" |
*
* @param {Settings_Password_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_saved = /** @type {((inputs?: Settings_Password_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_saved(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_saved(inputs)
	return en_settings_password_saved(inputs)
});