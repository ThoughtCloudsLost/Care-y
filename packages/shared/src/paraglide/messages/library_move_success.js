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

const en_xa2_library_move_success = /** @type {(inputs: Library_Move_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Mòvèd  ••${i?.moved} òf  ••${i?.total} àrtìclès •••⟧`)
};

/**
* | output |
* | --- |
* | "Moved {moved} of {total} articles" |
*
* @param {Library_Move_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_move_success = /** @type {((inputs: Library_Move_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Move_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_move_success(inputs)
	if (locale === "en-XA") return en_xa2_library_move_success(inputs)
	return en_library_move_success(inputs)
});