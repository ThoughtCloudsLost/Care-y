/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Color_SchemeInputs */

const en_settings_color_scheme = /** @type {(inputs: Settings_Color_SchemeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Color scheme`)
};

const es_settings_color_scheme = /** @type {(inputs: Settings_Color_SchemeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esquema de color`)
};

/**
* | output |
* | --- |
* | "Color scheme" |
*
* @param {Settings_Color_SchemeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_color_scheme = /** @type {((inputs?: Settings_Color_SchemeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Color_SchemeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_color_scheme(inputs)
	return es_settings_color_scheme(inputs)
});