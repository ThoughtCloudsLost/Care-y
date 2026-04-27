/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Recovery_PromptInputs */

const en_settings_password_recovery_prompt = /** @type {(inputs: Settings_Password_Recovery_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A previous password change did not finish. Enter your current password to complete the key rotation.`)
};

const es_settings_password_recovery_prompt = /** @type {(inputs: Settings_Password_Recovery_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un cambio de contrasena anterior no se completo. Ingresa tu contrasena actual para completar la rotacion de claves.`)
};

/**
* | output |
* | --- |
* | "A previous password change did not finish. Enter your current password to complete the key rotation." |
*
* @param {Settings_Password_Recovery_PromptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_recovery_prompt = /** @type {((inputs?: Settings_Password_Recovery_PromptInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Recovery_PromptInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_recovery_prompt(inputs)
	return es_settings_password_recovery_prompt(inputs)
});