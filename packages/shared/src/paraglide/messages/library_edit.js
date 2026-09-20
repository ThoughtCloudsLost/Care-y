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

const en_xa2_library_edit = /** @type {(inputs: Library_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt ••⟧`)
};

/**
* | output |
* | --- |
* | "Edit" |
*
* @param {Library_EditInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_edit = /** @type {((inputs?: Library_EditInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_EditInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_edit(inputs)
	if (locale === "en-XA") return en_xa2_library_edit(inputs)
	return en_library_edit(inputs)
});