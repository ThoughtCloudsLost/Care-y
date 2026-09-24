/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_UsernameInputs */

const en_settings_username = /** @type {(inputs: Settings_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login Username`)
};

const es_settings_username = /** @type {(inputs: Settings_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario de inicio de sesión`)
};

const en_xa2_settings_username = /** @type {(inputs: Settings_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lògìn Ùsèrnàmè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Login Username" |
*
* @param {Settings_UsernameInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_username = /** @type {((inputs?: Settings_UsernameInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_UsernameInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_username(inputs)
	if (locale === "en-XA") return en_xa2_settings_username(inputs)
	return en_settings_username(inputs)
});