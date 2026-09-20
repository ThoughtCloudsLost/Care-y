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

const en_xa2_library_editor_strikethrough = /** @type {(inputs: Library_Editor_StrikethroughInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Strìkèthròùgh ••••⟧`)
};

/**
* | output |
* | --- |
* | "Strikethrough" |
*
* @param {Library_Editor_StrikethroughInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_strikethrough = /** @type {((inputs?: Library_Editor_StrikethroughInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_StrikethroughInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_strikethrough(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_strikethrough(inputs)
	return en_library_editor_strikethrough(inputs)
});