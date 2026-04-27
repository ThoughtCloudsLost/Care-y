/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_ErrorInputs */

const en_settings_password_error = /** @type {(inputs: Settings_Password_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not change password`)
};

const es_settings_password_error = /** @type {(inputs: Settings_Password_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo cambiar la contrasena`)
};

/**
* | output |
* | --- |
* | "Could not change password" |
*
* @param {Settings_Password_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_error = /** @type {((inputs?: Settings_Password_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_error(inputs)
	return es_settings_password_error(inputs)
});