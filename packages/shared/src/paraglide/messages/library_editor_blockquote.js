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

const en_xa2_library_editor_blockquote = /** @type {(inputs: Library_Editor_BlockquoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Blòckqùòtè •••⟧`)
};

/**
* | output |
* | --- |
* | "Blockquote" |
*
* @param {Library_Editor_BlockquoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_blockquote = /** @type {((inputs?: Library_Editor_BlockquoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_BlockquoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_blockquote(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_blockquote(inputs)
	return en_library_editor_blockquote(inputs)
});