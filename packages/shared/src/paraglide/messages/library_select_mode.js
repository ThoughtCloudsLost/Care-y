/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Select_ModeInputs */

const en_library_select_mode = /** @type {(inputs: Library_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select`)
};

const es_library_select_mode = /** @type {(inputs: Library_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccionar`)
};

/**
* | output |
* | --- |
* | "Select" |
*
* @param {Library_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_select_mode = /** @type {((inputs?: Library_Select_ModeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Select_ModeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_select_mode(inputs)
	return es_library_select_mode(inputs)
});