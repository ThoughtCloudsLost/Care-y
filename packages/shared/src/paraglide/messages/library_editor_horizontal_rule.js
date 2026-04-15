/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Horizontal_RuleInputs */

const en_library_editor_horizontal_rule = /** @type {(inputs: Library_Editor_Horizontal_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Horizontal rule`)
};

const es_library_editor_horizontal_rule = /** @type {(inputs: Library_Editor_Horizontal_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Línea horizontal`)
};

/**
* | output |
* | --- |
* | "Horizontal rule" |
*
* @param {Library_Editor_Horizontal_RuleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_horizontal_rule = /** @type {((inputs?: Library_Editor_Horizontal_RuleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Horizontal_RuleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_horizontal_rule(inputs)
	return es_library_editor_horizontal_rule(inputs)
});