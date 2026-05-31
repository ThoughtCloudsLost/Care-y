/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Move_CategoryInputs */

const en_library_move_category = /** @type {(inputs: Library_Move_CategoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Move category`)
};

const es_library_move_category = /** @type {(inputs: Library_Move_CategoryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mover categoría`)
};

/**
* | output |
* | --- |
* | "Move category" |
*
* @param {Library_Move_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_move_category = /** @type {((inputs?: Library_Move_CategoryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Move_CategoryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_move_category(inputs)
	return es_library_move_category(inputs)
});