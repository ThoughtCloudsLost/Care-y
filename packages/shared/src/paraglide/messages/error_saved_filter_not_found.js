/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Saved_Filter_Not_FoundInputs */

const en_error_saved_filter_not_found = /** @type {(inputs: Error_Saved_Filter_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That shared filter no longer exists.`)
};

const es_error_saved_filter_not_found = /** @type {(inputs: Error_Saved_Filter_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ese filtro compartido ya no existe.`)
};

/**
* | output |
* | --- |
* | "That shared filter no longer exists." |
*
* @param {Error_Saved_Filter_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_saved_filter_not_found = /** @type {((inputs?: Error_Saved_Filter_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Saved_Filter_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_saved_filter_not_found(inputs)
	return en_error_saved_filter_not_found(inputs)
});