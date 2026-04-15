/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_BoldInputs */

const en_library_editor_bold = /** @type {(inputs: Library_Editor_BoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bold`)
};

const es_library_editor_bold = /** @type {(inputs: Library_Editor_BoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Negrita`)
};

/**
* | output |
* | --- |
* | "Bold" |
*
* @param {Library_Editor_BoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_bold = /** @type {((inputs?: Library_Editor_BoldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_BoldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_bold(inputs)
	return es_library_editor_bold(inputs)
});