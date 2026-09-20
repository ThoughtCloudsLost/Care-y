/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Dark_ModeInputs */

const en_settings_dark_mode = /** @type {(inputs: Settings_Dark_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dark`)
};

const es_settings_dark_mode = /** @type {(inputs: Settings_Dark_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Oscuro`)
};

const en_xa2_settings_dark_mode = /** @type {(inputs: Settings_Dark_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàrk ••⟧`)
};

/**
* | output |
* | --- |
* | "Dark" |
*
* @param {Settings_Dark_ModeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_dark_mode = /** @type {((inputs?: Settings_Dark_ModeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Dark_ModeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_dark_mode(inputs)
	if (locale === "en-XA") return en_xa2_settings_dark_mode(inputs)
	return en_settings_dark_mode(inputs)
});