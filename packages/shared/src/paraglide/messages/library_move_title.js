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

const en_xa2_library_move_title = /** @type {(inputs: Library_Move_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòvè tò càtègòry •••••⟧`)
};

/**
* | output |
* | --- |
* | "Move to category" |
*
* @param {Library_Move_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_move_title = /** @type {((inputs?: Library_Move_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Move_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_move_title(inputs)
	if (locale === "en-XA") return en_xa2_library_move_title(inputs)
	return en_library_move_title(inputs)
});