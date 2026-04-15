/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_ParagraphInputs */

const en_library_editor_paragraph = /** @type {(inputs: Library_Editor_ParagraphInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Normal text`)
};

const es_library_editor_paragraph = /** @type {(inputs: Library_Editor_ParagraphInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Texto normal`)
};

/**
* | output |
* | --- |
* | "Normal text" |
*
* @param {Library_Editor_ParagraphInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_paragraph = /** @type {((inputs?: Library_Editor_ParagraphInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_ParagraphInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_paragraph(inputs)
	return es_library_editor_paragraph(inputs)
});