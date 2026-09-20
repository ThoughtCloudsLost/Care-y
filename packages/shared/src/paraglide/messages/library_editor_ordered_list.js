/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Ordered_ListInputs */

const en_library_editor_ordered_list = /** @type {(inputs: Library_Editor_Ordered_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numbered list`)
};

const es_library_editor_ordered_list = /** @type {(inputs: Library_Editor_Ordered_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista numerada`)
};

const en_xa2_library_editor_ordered_list = /** @type {(inputs: Library_Editor_Ordered_ListInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nùmbèrèd lìst ••••⟧`)
};

/**
* | output |
* | --- |
* | "Numbered list" |
*
* @param {Library_Editor_Ordered_ListInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_ordered_list = /** @type {((inputs?: Library_Editor_Ordered_ListInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Ordered_ListInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_ordered_list(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_ordered_list(inputs)
	return en_library_editor_ordered_list(inputs)
});