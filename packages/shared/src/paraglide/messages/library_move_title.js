/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Move_TitleInputs */

const en_library_move_title = /** @type {(inputs: Library_Move_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Move to category`)
};

const es_library_move_title = /** @type {(inputs: Library_Move_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mover a categoría`)
};

/**
* | output |
* | --- |
* | "Move to category" |
*
* @param {Library_Move_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_move_title = /** @type {((inputs?: Library_Move_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Move_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_move_title(inputs)
	return es_library_move_title(inputs)
});