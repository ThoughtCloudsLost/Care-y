/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_PasswordInputs */

const en_settings_password = /** @type {(inputs: Settings_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password`)
};

const es_settings_password = /** @type {(inputs: Settings_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña`)
};

const en_xa2_settings_password = /** @type {(inputs: Settings_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrd •••⟧`)
};

/**
* | output |
* | --- |
* | "Password" |
*
* @param {Settings_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password = /** @type {((inputs?: Settings_PasswordInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_PasswordInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password(inputs)
	if (locale === "en-XA") return en_xa2_settings_password(inputs)
	return en_settings_password(inputs)
});