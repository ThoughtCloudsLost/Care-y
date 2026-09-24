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

const en_xa2_settings_password_step_derive = /** @type {(inputs: Settings_Password_Step_DeriveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gènèràtìng nèw kèys ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Generating new keys" |
*
* @param {Settings_Password_Step_DeriveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_derive = /** @type {((inputs?: Settings_Password_Step_DeriveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Step_DeriveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_step_derive(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_step_derive(inputs)
	return en_settings_password_step_derive(inputs)
});