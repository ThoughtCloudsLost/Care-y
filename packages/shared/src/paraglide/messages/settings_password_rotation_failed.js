/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Rotation_FailedInputs */

const en_settings_password_rotation_failed = /** @type {(inputs: Settings_Password_Rotation_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password changed, but key rotation failed. Tap retry to complete.`)
};

const es_settings_password_rotation_failed = /** @type {(inputs: Settings_Password_Rotation_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrasena cambiada, pero la rotacion de claves fallo. Toca reintentar para completar.`)
};

/**
* | output |
* | --- |
* | "Password changed, but key rotation failed. Tap retry to complete." |
*
* @param {Settings_Password_Rotation_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_rotation_failed = /** @type {((inputs?: Settings_Password_Rotation_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Rotation_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_rotation_failed(inputs)
	return es_settings_password_rotation_failed(inputs)
});