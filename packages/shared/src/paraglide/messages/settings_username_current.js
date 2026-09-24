/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Username_CurrentInputs */

const en_settings_username_current = /** @type {(inputs: Settings_Username_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current username`)
};

const es_settings_username_current = /** @type {(inputs: Settings_Username_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario actual`)
};

const en_xa2_settings_username_current = /** @type {(inputs: Settings_Username_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cùrrènt ùsèrnàmè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Current username" |
*
* @param {Settings_Username_CurrentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_username_current = /** @type {((inputs?: Settings_Username_CurrentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Username_CurrentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_username_current(inputs)
	if (locale === "en-XA") return en_xa2_settings_username_current(inputs)
	return en_settings_username_current(inputs)
});