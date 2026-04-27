/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_PasswordInputs */

const en_settings_password = /** @type {(inputs: Settings_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password`)
};

const es_settings_password = /** @type {(inputs: Settings_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrasena`)
};

/**
* | output |
* | --- |
* | "Password" |
*
* @param {Settings_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password = /** @type {((inputs?: Settings_PasswordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_PasswordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password(inputs)
	return es_settings_password(inputs)
});