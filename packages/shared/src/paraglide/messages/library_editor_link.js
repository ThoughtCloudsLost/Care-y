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

/**
* | output |
* | --- |
* | "Link" |
*
* @param {Library_Editor_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_link = /** @type {((inputs?: Library_Editor_LinkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_LinkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_link(inputs)
	return es_library_editor_link(inputs)
});