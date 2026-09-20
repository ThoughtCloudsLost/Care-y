/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Create_New_CategoryInputs */

const en_create_new_category = /** @type {(inputs: Create_New_CategoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New Category`)
};

const es_create_new_category = /** @type {(inputs: Create_New_CategoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nueva Categoría`)
};

const en_xa2_create_new_category = /** @type {(inputs: Create_New_CategoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw Càtègòry ••••⟧`)
};

/**
* | output |
* | --- |
* | "New Category" |
*
* @param {Create_New_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const create_new_category = /** @type {((inputs?: Create_New_CategoryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_New_CategoryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_create_new_category(inputs)
	if (locale === "en-XA") return en_xa2_create_new_category(inputs)
	return en_create_new_category(inputs)
});