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

const en_xa2_settings_color_scheme = /** @type {(inputs: Settings_Color_SchemeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còlòr schèmè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Color scheme" |
*
* @param {Settings_Color_SchemeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_color_scheme = /** @type {((inputs?: Settings_Color_SchemeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Color_SchemeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_color_scheme(inputs)
	if (locale === "en-XA") return en_xa2_settings_color_scheme(inputs)
	return en_settings_color_scheme(inputs)
});