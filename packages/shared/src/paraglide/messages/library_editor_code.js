/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_CodeInputs */

const en_library_editor_code = /** @type {(inputs: Library_Editor_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inline code`)
};

const es_library_editor_code = /** @type {(inputs: Library_Editor_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Código en línea`)
};

/**
* | output |
* | --- |
* | "Inline code" |
*
* @param {Library_Editor_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_code = /** @type {((inputs?: Library_Editor_CodeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_CodeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_code(inputs)
	return es_library_editor_code(inputs)
});