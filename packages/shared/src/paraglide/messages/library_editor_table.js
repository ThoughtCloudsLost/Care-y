/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_TableInputs */

const en_library_editor_table = /** @type {(inputs: Library_Editor_TableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Table`)
};

const es_library_editor_table = /** @type {(inputs: Library_Editor_TableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tabla`)
};

/**
* | output |
* | --- |
* | "Table" |
*
* @param {Library_Editor_TableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_table = /** @type {((inputs?: Library_Editor_TableInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_TableInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_table(inputs)
	return es_library_editor_table(inputs)
});