/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Step_RefreshInputs */

const en_settings_password_step_refresh = /** @type {(inputs: Settings_Password_Step_RefreshInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Refreshing session`)
};

const es_settings_password_step_refresh = /** @type {(inputs: Settings_Password_Step_RefreshInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actualizando sesion`)
};

/**
* | output |
* | --- |
* | "Refreshing session" |
*
* @param {Settings_Password_Step_RefreshInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_refresh = /** @type {((inputs?: Settings_Password_Step_RefreshInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Step_RefreshInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_step_refresh(inputs)
	return es_settings_password_step_refresh(inputs)
});