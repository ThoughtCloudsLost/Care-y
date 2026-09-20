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

const en_xa2_library_editor_link_text = /** @type {(inputs: Library_Editor_Link_TextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnk tèxt •••⟧`)
};

/**
* | output |
* | --- |
* | "Link text" |
*
* @param {Library_Editor_Link_TextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_text = /** @type {((inputs?: Library_Editor_Link_TextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Link_TextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_link_text(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_link_text(inputs)
	return en_library_editor_link_text(inputs)
});