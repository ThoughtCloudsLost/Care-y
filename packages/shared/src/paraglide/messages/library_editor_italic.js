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

const en_xa2_library_editor_italic = /** @type {(inputs: Library_Editor_ItalicInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìtàlìc ••⟧`)
};

/**
* | output |
* | --- |
* | "Italic" |
*
* @param {Library_Editor_ItalicInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_italic = /** @type {((inputs?: Library_Editor_ItalicInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_ItalicInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_italic(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_italic(inputs)
	return en_library_editor_italic(inputs)
});