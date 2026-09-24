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

const en_xa2_library_editor_alt_text_title = /** @type {(inputs: Library_Editor_Alt_Text_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèscrìbè thìs ìmàgè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Describe this image" |
*
* @param {Library_Editor_Alt_Text_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_alt_text_title = /** @type {((inputs?: Library_Editor_Alt_Text_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Alt_Text_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_alt_text_title(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_alt_text_title(inputs)
	return en_library_editor_alt_text_title(inputs)
});