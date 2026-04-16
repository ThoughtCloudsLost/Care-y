/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_A11y_Tooltip_FixInputs */

const en_library_a11y_tooltip_fix = /** @type {(inputs: Library_A11y_Tooltip_FixInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fix`)
};

const es_library_a11y_tooltip_fix = /** @type {(inputs: Library_A11y_Tooltip_FixInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Corregir`)
};

/**
* | output |
* | --- |
* | "Fix" |
*
* @param {Library_A11y_Tooltip_FixInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_tooltip_fix = /** @type {((inputs?: Library_A11y_Tooltip_FixInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_A11y_Tooltip_FixInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_a11y_tooltip_fix(inputs)
	return es_library_a11y_tooltip_fix(inputs)
});