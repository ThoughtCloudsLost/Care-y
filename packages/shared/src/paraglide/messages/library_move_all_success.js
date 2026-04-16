/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Move_All_SuccessInputs */

const en_library_move_all_success = /** @type {(inputs: Library_Move_All_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Moved ${i?.count} articles`)
};

const es_library_move_all_success = /** @type {(inputs: Library_Move_All_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se movieron ${i?.count} artículos`)
};

/**
* | output |
* | --- |
* | "Moved {count} articles" |
*
* @param {Library_Move_All_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_move_all_success = /** @type {((inputs: Library_Move_All_SuccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Move_All_SuccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_move_all_success(inputs)
	return es_library_move_all_success(inputs)
});