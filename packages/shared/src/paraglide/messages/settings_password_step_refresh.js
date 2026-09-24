/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Step_RefreshInputs */

const en_settings_password_step_refresh = /** @type {(inputs: Settings_Password_Step_RefreshInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Refreshing session`)
};

const es_settings_password_step_refresh = /** @type {(inputs: Settings_Password_Step_RefreshInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actualizando sesión`)
};

const en_xa2_settings_password_step_refresh = /** @type {(inputs: Settings_Password_Step_RefreshInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèfrèshìng sèssìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Refreshing session" |
*
* @param {Settings_Password_Step_RefreshInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_step_refresh = /** @type {((inputs?: Settings_Password_Step_RefreshInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Step_RefreshInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_step_refresh(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_step_refresh(inputs)
	return en_settings_password_step_refresh(inputs)
});