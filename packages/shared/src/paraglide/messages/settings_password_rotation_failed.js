/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Rotation_FailedInputs */

const en_settings_password_rotation_failed = /** @type {(inputs: Settings_Password_Rotation_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password changed, but key rotation failed. Tap retry to complete.`)
};

const es_settings_password_rotation_failed = /** @type {(inputs: Settings_Password_Rotation_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña cambiada, pero la rotación de claves fallo. Toca reintentar para completar.`)
};

const en_xa2_settings_password_rotation_failed = /** @type {(inputs: Settings_Password_Rotation_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrd chàngèd, bùt kèy ròtàtìòn fàìlèd. Tàp rètry tò còmplètè. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Password changed, but key rotation failed. Tap retry to complete." |
*
* @param {Settings_Password_Rotation_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_rotation_failed = /** @type {((inputs?: Settings_Password_Rotation_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Rotation_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_rotation_failed(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_rotation_failed(inputs)
	return en_settings_password_rotation_failed(inputs)
});