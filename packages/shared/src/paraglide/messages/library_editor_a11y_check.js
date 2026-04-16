/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_A11y_CheckInputs */

const en_library_editor_a11y_check = /** @type {(inputs: Library_Editor_A11y_CheckInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Check accessibility`)
};

const es_library_editor_a11y_check = /** @type {(inputs: Library_Editor_A11y_CheckInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revisar accesibilidad`)
};

/**
* | output |
* | --- |
* | "Check accessibility" |
*
* @param {Library_Editor_A11y_CheckInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_a11y_check = /** @type {((inputs?: Library_Editor_A11y_CheckInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_A11y_CheckInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_a11y_check(inputs)
	return es_library_editor_a11y_check(inputs)
});