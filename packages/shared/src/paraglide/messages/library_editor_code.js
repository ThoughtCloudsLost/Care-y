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

const en_xa2_library_editor_code = /** @type {(inputs: Library_Editor_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnlìnè còdè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Inline code" |
*
* @param {Library_Editor_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_code = /** @type {((inputs?: Library_Editor_CodeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_CodeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_code(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_code(inputs)
	return en_library_editor_code(inputs)
});