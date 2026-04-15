/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Code_BlockInputs */

const en_library_editor_code_block = /** @type {(inputs: Library_Editor_Code_BlockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Code block`)
};

const es_library_editor_code_block = /** @type {(inputs: Library_Editor_Code_BlockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bloque de código`)
};

/**
* | output |
* | --- |
* | "Code block" |
*
* @param {Library_Editor_Code_BlockInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_code_block = /** @type {((inputs?: Library_Editor_Code_BlockInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Code_BlockInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_code_block(inputs)
	return es_library_editor_code_block(inputs)
});