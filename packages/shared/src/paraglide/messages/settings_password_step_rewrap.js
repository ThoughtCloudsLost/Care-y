/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Step_RewrapInputs */

const en_settings_password_step_rewrap = /** @type {(inputs: Settings_Password_Step_RewrapInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Re-encrypting ticket keys`)
};

const es_settings_password_step_rewrap = /** @type {(inputs: Settings_Password_Step_RewrapInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recifrando claves de tickets`)
};

/**
* | output |
* | --- |
* | "Re-encrypting ticket keys" |
*
* @param {Settings_Password_Step_RewrapInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_rewrap = /** @type {((inputs?: Settings_Password_Step_RewrapInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Step_RewrapInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_step_rewrap(inputs)
	return es_settings_password_step_rewrap(inputs)
});