/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_A11y_Fix_NowInputs */

const en_library_a11y_fix_now = /** @type {(inputs: Library_A11y_Fix_NowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fix now`)
};

const es_library_a11y_fix_now = /** @type {(inputs: Library_A11y_Fix_NowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corregir ahora`)
};

/**
* | output |
* | --- |
* | "Fix now" |
*
* @param {Library_A11y_Fix_NowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_fix_now = /** @type {((inputs?: Library_A11y_Fix_NowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_A11y_Fix_NowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_a11y_fix_now(inputs)
	return es_library_a11y_fix_now(inputs)
});