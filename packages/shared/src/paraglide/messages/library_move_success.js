/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ moved: NonNullable<unknown>, total: NonNullable<unknown> }} Library_Move_SuccessInputs */

const en_library_move_success = /** @type {(inputs: Library_Move_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Moved ${i?.moved} of ${i?.total} articles`)
};

const es_library_move_success = /** @type {(inputs: Library_Move_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se movieron ${i?.moved} de ${i?.total} artículos`)
};

/**
* | output |
* | --- |
* | "Moved {moved} of {total} articles" |
*
* @param {Library_Move_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_move_success = /** @type {((inputs: Library_Move_SuccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Move_SuccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_move_success(inputs)
	return es_library_move_success(inputs)
});