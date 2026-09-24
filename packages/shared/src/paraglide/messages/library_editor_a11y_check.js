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

const en_xa2_library_editor_a11y_check = /** @type {(inputs: Library_Editor_A11y_CheckInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chèck àccèssìbìlìty ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Check accessibility" |
*
* @param {Library_Editor_A11y_CheckInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_a11y_check = /** @type {((inputs?: Library_Editor_A11y_CheckInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_A11y_CheckInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_a11y_check(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_a11y_check(inputs)
	return en_library_editor_a11y_check(inputs)
});