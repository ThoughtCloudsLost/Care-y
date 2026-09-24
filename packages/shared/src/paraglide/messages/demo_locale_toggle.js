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

const en_xa2_demo_locale_toggle = /** @type {(inputs: Demo_Locale_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Swìtch làngùàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Switch language" |
*
* @param {Demo_Locale_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_locale_toggle = /** @type {((inputs?: Demo_Locale_ToggleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Locale_ToggleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_locale_toggle(inputs)
	if (locale === "en-XA") return en_xa2_demo_locale_toggle(inputs)
	return en_demo_locale_toggle(inputs)
});