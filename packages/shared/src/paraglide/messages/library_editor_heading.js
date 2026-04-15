/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_HeadingInputs */

const en_library_editor_heading = /** @type {(inputs: Library_Editor_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Heading`)
};

const es_library_editor_heading = /** @type {(inputs: Library_Editor_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encabezado`)
};

/**
* | output |
* | --- |
* | "Heading" |
*
* @param {Library_Editor_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_heading = /** @type {((inputs?: Library_Editor_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_heading(inputs)
	return es_library_editor_heading(inputs)
});