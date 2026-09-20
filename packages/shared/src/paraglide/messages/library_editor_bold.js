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

const en_xa2_library_editor_bold = /** @type {(inputs: Library_Editor_BoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bòld ••⟧`)
};

/**
* | output |
* | --- |
* | "Bold" |
*
* @param {Library_Editor_BoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_bold = /** @type {((inputs?: Library_Editor_BoldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_BoldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_bold(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_bold(inputs)
	return en_library_editor_bold(inputs)
});