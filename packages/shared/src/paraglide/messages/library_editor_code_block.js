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

const en_xa2_library_editor_code_block = /** @type {(inputs: Library_Editor_Code_BlockInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còdè blòck •••⟧`)
};

/**
* | output |
* | --- |
* | "Code block" |
*
* @param {Library_Editor_Code_BlockInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_code_block = /** @type {((inputs?: Library_Editor_Code_BlockInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Code_BlockInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_code_block(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_code_block(inputs)
	return en_library_editor_code_block(inputs)
});