/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Link_TextInputs */

const en_library_editor_link_text = /** @type {(inputs: Library_Editor_Link_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link text`)
};

const es_library_editor_link_text = /** @type {(inputs: Library_Editor_Link_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto del enlace`)
};

/**
* | output |
* | --- |
* | "Link text" |
*
* @param {Library_Editor_Link_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_text = /** @type {((inputs?: Library_Editor_Link_TextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Link_TextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_link_text(inputs)
	return es_library_editor_link_text(inputs)
});