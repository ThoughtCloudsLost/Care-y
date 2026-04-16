/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_ItalicInputs */

const en_library_editor_italic = /** @type {(inputs: Library_Editor_ItalicInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Italic`)
};

const es_library_editor_italic = /** @type {(inputs: Library_Editor_ItalicInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cursiva`)
};

/**
* | output |
* | --- |
* | "Italic" |
*
* @param {Library_Editor_ItalicInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_italic = /** @type {((inputs?: Library_Editor_ItalicInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_ItalicInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_italic(inputs)
	return es_library_editor_italic(inputs)
});