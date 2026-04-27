/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Username_PasswordInputs */

const en_settings_username_password = /** @type {(inputs: Settings_Username_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current password`)
};

const es_settings_username_password = /** @type {(inputs: Settings_Username_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrasena actual`)
};

/**
* | output |
* | --- |
* | "Current password" |
*
* @param {Settings_Username_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_username_password = /** @type {((inputs?: Settings_Username_PasswordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Username_PasswordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_username_password(inputs)
	return es_settings_username_password(inputs)
});