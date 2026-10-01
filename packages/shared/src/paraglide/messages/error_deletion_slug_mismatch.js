/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Deletion_Slug_MismatchInputs */

const en_error_deletion_slug_mismatch = /** @type {(inputs: Error_Deletion_Slug_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The confirmation does not match the organization's address exactly.`)
};

const es_error_deletion_slug_mismatch = /** @type {(inputs: Error_Deletion_Slug_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La confirmación no coincide exactamente con la dirección de la organización.`)
};

const en_xa2_error_deletion_slug_mismatch = /** @type {(inputs: Error_Deletion_Slug_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè cònfìrmàtìòn dòès nòt màtch thè òrgànìzàtìòn's àddrèss èxàctly. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The confirmation does not match the organization's address exactly." |
*
* @param {Error_Deletion_Slug_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_deletion_slug_mismatch = /** @type {((inputs?: Error_Deletion_Slug_MismatchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Deletion_Slug_MismatchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_deletion_slug_mismatch(inputs)
	if (locale === "en-XA") return en_xa2_error_deletion_slug_mismatch(inputs)
	return en_error_deletion_slug_mismatch(inputs)
});