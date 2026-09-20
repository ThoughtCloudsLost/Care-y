/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_LinkInputs */

const en_library_editor_link = /** @type {(inputs: Library_Editor_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link`)
};

const es_library_editor_link = /** @type {(inputs: Library_Editor_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace`)
};

const en_xa2_library_editor_link = /** @type {(inputs: Library_Editor_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnk ••⟧`)
};

/**
* | output |
* | --- |
* | "Link" |
*
* @param {Library_Editor_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_link = /** @type {((inputs?: Library_Editor_LinkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_LinkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_link(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_link(inputs)
	return en_library_editor_link(inputs)
});