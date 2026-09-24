/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Recovery_PromptInputs */

const en_settings_password_recovery_prompt = /** @type {(inputs: Settings_Password_Recovery_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A previous password change did not finish. Enter your current password to complete the key rotation.`)
};

const es_settings_password_recovery_prompt = /** @type {(inputs: Settings_Password_Recovery_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un cambio de contraseña anterior no se completo. Ingresa tu contraseña actual para completar la rotación de claves.`)
};

const en_xa2_settings_password_recovery_prompt = /** @type {(inputs: Settings_Password_Recovery_PromptInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À prèvìòùs pàsswòrd chàngè dìd nòt fìnìsh. Èntèr yòùr cùrrènt pàsswòrd tò còmplètè thè kèy ròtàtìòn. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A previous password change did not finish. Enter your current password to complete the key rotation." |
*
* @param {Settings_Password_Recovery_PromptInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_recovery_prompt = /** @type {((inputs?: Settings_Password_Recovery_PromptInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Recovery_PromptInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_recovery_prompt(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_recovery_prompt(inputs)
	return en_settings_password_recovery_prompt(inputs)
});