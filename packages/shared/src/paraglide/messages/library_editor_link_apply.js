/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Link_ApplyInputs */

const en_library_editor_link_apply = /** @type {(inputs: Library_Editor_Link_ApplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Apply`)
};

const es_library_editor_link_apply = /** @type {(inputs: Library_Editor_Link_ApplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aplicar`)
};

/**
* | output |
* | --- |
* | "Apply" |
*
* @param {Library_Editor_Link_ApplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_apply = /** @type {((inputs?: Library_Editor_Link_ApplyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Link_ApplyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_link_apply(inputs)
	return es_library_editor_link_apply(inputs)
});