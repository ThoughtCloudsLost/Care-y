/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_EditInputs */

const en_library_edit = /** @type {(inputs: Library_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit`)
};

const es_library_edit = /** @type {(inputs: Library_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar`)
};

/**
* | output |
* | --- |
* | "Edit" |
*
* @param {Library_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_edit = /** @type {((inputs?: Library_EditInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_EditInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_edit(inputs)
	return es_library_edit(inputs)
});