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

const en_xa2_library_a11y_tooltip_fix = /** @type {(inputs: Library_A11y_Tooltip_FixInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìx •⟧`)
};

/**
* | output |
* | --- |
* | "Fix" |
*
* @param {Library_A11y_Tooltip_FixInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_a11y_tooltip_fix = /** @type {((inputs?: Library_A11y_Tooltip_FixInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_A11y_Tooltip_FixInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_a11y_tooltip_fix(inputs)
	if (locale === "en-XA") return en_xa2_library_a11y_tooltip_fix(inputs)
	return en_library_a11y_tooltip_fix(inputs)
});