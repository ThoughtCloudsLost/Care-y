/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ deleted: NonNullable<unknown>, total: NonNullable<unknown> }} Library_Delete_SuccessInputs */

const en_library_delete_success = /** @type {(inputs: Library_Delete_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Deleted ${i?.deleted} of ${i?.total} articles`)
};

const es_library_delete_success = /** @type {(inputs: Library_Delete_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se eliminaron ${i?.deleted} de ${i?.total} artículos`)
};

const en_xa2_library_delete_success = /** @type {(inputs: Library_Delete_SuccessInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèlètèd  •••${i?.deleted} òf  ••${i?.total} àrtìclès •••⟧`)
};

/**
* | output |
* | --- |
* | "Deleted {deleted} of {total} articles" |
*
* @param {Library_Delete_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_delete_success = /** @type {((inputs: Library_Delete_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Delete_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_delete_success(inputs)
	if (locale === "en-XA") return en_xa2_library_delete_success(inputs)
	return en_library_delete_success(inputs)
});