/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Locale_ToggleInputs */

const en_demo_locale_toggle = /** @type {(inputs: Demo_Locale_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch language`)
};

const es_demo_locale_toggle = /** @type {(inputs: Demo_Locale_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar idioma`)
};

/**
* | output |
* | --- |
* | "Switch language" |
*
* @param {Demo_Locale_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_locale_toggle = /** @type {((inputs?: Demo_Locale_ToggleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Locale_ToggleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_locale_toggle(inputs)
	return es_demo_locale_toggle(inputs)
});