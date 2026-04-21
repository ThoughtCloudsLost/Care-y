/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Step_RotateInputs */

const en_settings_password_step_rotate = /** @type {(inputs: Settings_Password_Step_RotateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Finalizing key rotation`)
};

const es_settings_password_step_rotate = /** @type {(inputs: Settings_Password_Step_RotateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Finalizando rotacion de claves`)
};

/**
* | output |
* | --- |
* | "Finalizing key rotation" |
*
* @param {Settings_Password_Step_RotateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_rotate = /** @type {((inputs?: Settings_Password_Step_RotateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Step_RotateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_step_rotate(inputs)
	return es_settings_password_step_rotate(inputs)
});