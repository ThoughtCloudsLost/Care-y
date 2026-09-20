/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_CurrentInputs */

const en_settings_password_current = /** @type {(inputs: Settings_Password_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current password`)
};

const es_settings_password_current = /** @type {(inputs: Settings_Password_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña actual`)
};

const en_xa2_settings_password_current = /** @type {(inputs: Settings_Password_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cùrrènt pàsswòrd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Current password" |
*
* @param {Settings_Password_CurrentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_current = /** @type {((inputs?: Settings_Password_CurrentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_CurrentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_current(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_current(inputs)
	return en_settings_password_current(inputs)
});