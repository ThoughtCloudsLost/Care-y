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

/**
* | output |
* | --- |
* | "Dark" |
*
* @param {Settings_Dark_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_dark_mode = /** @type {((inputs?: Settings_Dark_ModeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Dark_ModeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_dark_mode(inputs)
	return es_settings_dark_mode(inputs)
});