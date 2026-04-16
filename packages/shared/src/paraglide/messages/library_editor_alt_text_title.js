/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Alt_Text_TitleInputs */

const en_library_editor_alt_text_title = /** @type {(inputs: Library_Editor_Alt_Text_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Describe this image`)
};

const es_library_editor_alt_text_title = /** @type {(inputs: Library_Editor_Alt_Text_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Describe esta imagen`)
};

/**
* | output |
* | --- |
* | "Describe this image" |
*
* @param {Library_Editor_Alt_Text_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_alt_text_title = /** @type {((inputs?: Library_Editor_Alt_Text_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Alt_Text_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_alt_text_title(inputs)
	return es_library_editor_alt_text_title(inputs)
});