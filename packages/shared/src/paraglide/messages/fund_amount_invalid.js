/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Amount_InvalidInputs */

const en_fund_amount_invalid = /** @type {(inputs: Fund_Amount_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter an amount above zero, with up to two decimals.`)
};

const es_fund_amount_invalid = /** @type {(inputs: Fund_Amount_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe un importe mayor que cero, con dos decimales como máximo.`)
};

const en_xa2_fund_amount_invalid = /** @type {(inputs: Fund_Amount_InvalidInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr àn àmòùnt àbòvè zèrò, wìth ùp tò twò dècìmàls. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter an amount above zero, with up to two decimals." |
*
* @param {Fund_Amount_InvalidInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_amount_invalid = /** @type {((inputs?: Fund_Amount_InvalidInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Amount_InvalidInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_amount_invalid(inputs)
	if (locale === "en-XA") return en_xa2_fund_amount_invalid(inputs)
	return en_fund_amount_invalid(inputs)
});