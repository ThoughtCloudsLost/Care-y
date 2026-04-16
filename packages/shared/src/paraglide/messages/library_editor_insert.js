/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_InsertInputs */

const en_library_editor_insert = /** @type {(inputs: Library_Editor_InsertInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Insert`)
};

const es_library_editor_insert = /** @type {(inputs: Library_Editor_InsertInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Insertar`)
};

/**
* | output |
* | --- |
* | "Insert" |
*
* @param {Library_Editor_InsertInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_insert = /** @type {((inputs?: Library_Editor_InsertInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_InsertInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_insert(inputs)
	return es_library_editor_insert(inputs)
});