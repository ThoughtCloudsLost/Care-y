/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_StrikethroughInputs */

const en_library_editor_strikethrough = /** @type {(inputs: Library_Editor_StrikethroughInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Strikethrough`)
};

const es_library_editor_strikethrough = /** @type {(inputs: Library_Editor_StrikethroughInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tachado`)
};

/**
* | output |
* | --- |
* | "Strikethrough" |
*
* @param {Library_Editor_StrikethroughInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_strikethrough = /** @type {((inputs?: Library_Editor_StrikethroughInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_StrikethroughInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_strikethrough(inputs)
	return es_library_editor_strikethrough(inputs)
});