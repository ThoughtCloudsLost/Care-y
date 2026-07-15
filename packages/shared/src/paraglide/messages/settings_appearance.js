/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_AppearanceInputs */

const en_settings_appearance = /** @type {(inputs: Settings_AppearanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Appearance`)
};

const es_settings_appearance = /** @type {(inputs: Settings_AppearanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Apariencia`)
};

/**
* | output |
* | --- |
* | "Appearance" |
*
* @param {Settings_AppearanceInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_appearance = /** @type {((inputs?: Settings_AppearanceInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_AppearanceInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_appearance(inputs)
	return es_settings_appearance(inputs)
});