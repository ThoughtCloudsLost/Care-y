/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_BlockquoteInputs */

const en_library_editor_blockquote = /** @type {(inputs: Library_Editor_BlockquoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Blockquote`)
};

const es_library_editor_blockquote = /** @type {(inputs: Library_Editor_BlockquoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cita`)
};

/**
* | output |
* | --- |
* | "Blockquote" |
*
* @param {Library_Editor_BlockquoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_blockquote = /** @type {((inputs?: Library_Editor_BlockquoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_BlockquoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_blockquote(inputs)
	return es_library_editor_blockquote(inputs)
});