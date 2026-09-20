/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, tickets: NonNullable<unknown> }} Settings_Password_Step_RewrapInputs */

const en_settings_password_step_rewrap = /** @type {(inputs: Settings_Password_Step_RewrapInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Re-encrypting ${i?.ticket} keys`)
};

const es_settings_password_step_rewrap = /** @type {(inputs: Settings_Password_Step_RewrapInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Recifrando claves de ${i?.tickets}`)
};

const en_xa2_settings_password_step_rewrap = /** @type {(inputs: Settings_Password_Step_RewrapInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Rè-èncryptìng  •••••${i?.ticket} kèys ••⟧`)
};

/**
* | output |
* | --- |
* | "Re-encrypting {ticket} keys" |
*
* @param {Settings_Password_Step_RewrapInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_rewrap = /** @type {((inputs: Settings_Password_Step_RewrapInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Step_RewrapInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_step_rewrap(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_step_rewrap(inputs)
	return en_settings_password_step_rewrap(inputs)
});