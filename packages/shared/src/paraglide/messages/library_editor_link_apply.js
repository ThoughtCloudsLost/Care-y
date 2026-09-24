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

const en_xa2_library_editor_link_apply = /** @type {(inputs: Library_Editor_Link_ApplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àpply ••⟧`)
};

/**
* | output |
* | --- |
* | "Apply" |
*
* @param {Library_Editor_Link_ApplyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_apply = /** @type {((inputs?: Library_Editor_Link_ApplyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Link_ApplyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_link_apply(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_link_apply(inputs)
	return en_library_editor_link_apply(inputs)
});