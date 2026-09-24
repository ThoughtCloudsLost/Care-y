/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_ErrorInputs */

const en_settings_password_error = /** @type {(inputs: Settings_Password_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not change password`)
};

const es_settings_password_error = /** @type {(inputs: Settings_Password_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo cambiar la contraseña`)
};

const en_xa2_settings_password_error = /** @type {(inputs: Settings_Password_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt chàngè pàsswòrd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not change password" |
*
* @param {Settings_Password_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_error = /** @type {((inputs?: Settings_Password_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_error(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_error(inputs)
	return en_settings_password_error(inputs)
});