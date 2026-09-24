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

const en_xa2_error_merge_already_undone = /** @type {(inputs: Error_Merge_Already_UndoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs mèrgè hàs àlrèàdy bèèn ùndònè. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This merge has already been undone." |
*
* @param {Error_Merge_Already_UndoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_merge_already_undone = /** @type {((inputs?: Error_Merge_Already_UndoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Merge_Already_UndoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_merge_already_undone(inputs)
	if (locale === "en-XA") return en_xa2_error_merge_already_undone(inputs)
	return en_error_merge_already_undone(inputs)
});