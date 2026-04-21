/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_CurrentInputs */

const en_settings_password_current = /** @type {(inputs: Settings_Password_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current password`)
};

const es_settings_password_current = /** @type {(inputs: Settings_Password_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrasena actual`)
};

/**
* | output |
* | --- |
* | "Current password" |
*
* @param {Settings_Password_CurrentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_current = /** @type {((inputs?: Settings_Password_CurrentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_CurrentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_current(inputs)
	return es_settings_password_current(inputs)
});