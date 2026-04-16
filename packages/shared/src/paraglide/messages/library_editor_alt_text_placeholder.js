/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Alt_Text_PlaceholderInputs */

const en_library_editor_alt_text_placeholder = /** @type {(inputs: Library_Editor_Alt_Text_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Description for screen readers`)
};

const es_library_editor_alt_text_placeholder = /** @type {(inputs: Library_Editor_Alt_Text_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descripción para lectores de pantalla`)
};

/**
* | output |
* | --- |
* | "Description for screen readers" |
*
* @param {Library_Editor_Alt_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_alt_text_placeholder = /** @type {((inputs?: Library_Editor_Alt_Text_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Alt_Text_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_alt_text_placeholder(inputs)
	return es_library_editor_alt_text_placeholder(inputs)
});