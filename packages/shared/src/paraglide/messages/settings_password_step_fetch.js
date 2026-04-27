/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Step_FetchInputs */

const en_settings_password_step_fetch = /** @type {(inputs: Settings_Password_Step_FetchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading encryption data`)
};

const es_settings_password_step_fetch = /** @type {(inputs: Settings_Password_Step_FetchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando datos de cifrado`)
};

/**
* | output |
* | --- |
* | "Loading encryption data" |
*
* @param {Settings_Password_Step_FetchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_fetch = /** @type {((inputs?: Settings_Password_Step_FetchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Step_FetchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_step_fetch(inputs)
	return es_settings_password_step_fetch(inputs)
});