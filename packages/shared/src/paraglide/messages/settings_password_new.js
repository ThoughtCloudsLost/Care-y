/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_NewInputs */

const en_settings_password_new = /** @type {(inputs: Settings_Password_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New password (16+ characters)`)
};

const es_settings_password_new = /** @type {(inputs: Settings_Password_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nueva contraseña (16+ caracteres)`)
};

const en_xa2_settings_password_new = /** @type {(inputs: Settings_Password_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw pàsswòrd (16+ chàràctèrs) •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "New password (16+ characters)" |
*
* @param {Settings_Password_NewInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_new = /** @type {((inputs?: Settings_Password_NewInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_NewInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_new(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_new(inputs)
	return en_settings_password_new(inputs)
});