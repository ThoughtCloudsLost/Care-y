/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Fund_Not_FoundInputs */

const en_error_fund_not_found = /** @type {(inputs: Error_Fund_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That fund no longer exists.`)
};

const es_error_fund_not_found = /** @type {(inputs: Error_Fund_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ese fondo ya no existe.`)
};

const en_xa2_error_fund_not_found = /** @type {(inputs: Error_Fund_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thàt fùnd nò lòngèr èxìsts. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "That fund no longer exists." |
*
* @param {Error_Fund_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_fund_not_found = /** @type {((inputs?: Error_Fund_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Fund_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_fund_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_fund_not_found(inputs)
	return en_error_fund_not_found(inputs)
});