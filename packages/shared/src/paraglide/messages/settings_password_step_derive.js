/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Step_DeriveInputs */

const en_settings_password_step_derive = /** @type {(inputs: Settings_Password_Step_DeriveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generating new keys`)
};

const es_settings_password_step_derive = /** @type {(inputs: Settings_Password_Step_DeriveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generando nuevas claves`)
};

/**
* | output |
* | --- |
* | "Generating new keys" |
*
* @param {Settings_Password_Step_DeriveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_derive = /** @type {((inputs?: Settings_Password_Step_DeriveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Step_DeriveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_step_derive(inputs)
	return es_settings_password_step_derive(inputs)
});