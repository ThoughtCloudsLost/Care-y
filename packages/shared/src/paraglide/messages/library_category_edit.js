/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_EditInputs */

const en_library_category_edit = /** @type {(inputs: Library_Category_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit`)
};

const es_library_category_edit = /** @type {(inputs: Library_Category_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar`)
};

const en_xa2_library_category_edit = /** @type {(inputs: Library_Category_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt ••⟧`)
};

/**
* | output |
* | --- |
* | "Edit" |
*
* @param {Library_Category_EditInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_edit = /** @type {((inputs?: Library_Category_EditInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_EditInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_edit(inputs)
	if (locale === "en-XA") return en_xa2_library_category_edit(inputs)
	return en_library_category_edit(inputs)
});