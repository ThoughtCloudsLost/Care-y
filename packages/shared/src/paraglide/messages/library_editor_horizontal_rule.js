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

const en_xa2_library_editor_horizontal_rule = /** @type {(inputs: Library_Editor_Horizontal_RuleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòrìzòntàl rùlè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Horizontal rule" |
*
* @param {Library_Editor_Horizontal_RuleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_horizontal_rule = /** @type {((inputs?: Library_Editor_Horizontal_RuleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Horizontal_RuleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_horizontal_rule(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_horizontal_rule(inputs)
	return en_library_editor_horizontal_rule(inputs)
});