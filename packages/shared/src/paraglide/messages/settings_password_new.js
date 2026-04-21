/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_NewInputs */

const en_settings_password_new = /** @type {(inputs: Settings_Password_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New password (16+ characters)`)
};

const es_settings_password_new = /** @type {(inputs: Settings_Password_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nueva contrasena (16+ caracteres)`)
};

/**
* | output |
* | --- |
* | "New password (16+ characters)" |
*
* @param {Settings_Password_NewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_new = /** @type {((inputs?: Settings_Password_NewInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_NewInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_new(inputs)
	return es_settings_password_new(inputs)
});