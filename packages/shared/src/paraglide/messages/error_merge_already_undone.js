/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Merge_Already_UndoneInputs */

const en_error_merge_already_undone = /** @type {(inputs: Error_Merge_Already_UndoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This merge has already been undone.`)
};

const es_error_merge_already_undone = /** @type {(inputs: Error_Merge_Already_UndoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta fusión ya ha sido deshecha.`)
};

/**
* | output |
* | --- |
* | "This merge has already been undone." |
*
* @param {Error_Merge_Already_UndoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_merge_already_undone = /** @type {((inputs?: Error_Merge_Already_UndoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Merge_Already_UndoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_merge_already_undone(inputs)
	return es_error_merge_already_undone(inputs)
});