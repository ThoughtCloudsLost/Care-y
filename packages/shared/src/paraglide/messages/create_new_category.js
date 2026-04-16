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

/**
* | output |
* | --- |
* | "New Category" |
*
* @param {Create_New_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_new_category = /** @type {((inputs?: Create_New_CategoryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_New_CategoryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_create_new_category(inputs)
	return es_create_new_category(inputs)
});