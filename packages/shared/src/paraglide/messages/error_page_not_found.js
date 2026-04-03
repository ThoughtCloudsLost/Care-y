/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Page_Not_FoundInputs */

const en_error_page_not_found = /** @type {(inputs: Error_Page_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This page does not exist.`)
};

const es_error_page_not_found = /** @type {(inputs: Error_Page_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta página no existe.`)
};

/**
* | output |
* | --- |
* | "This page does not exist." |
*
* @param {Error_Page_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_page_not_found = /** @type {((inputs?: Error_Page_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Page_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_page_not_found(inputs)
	return es_error_page_not_found(inputs)
});