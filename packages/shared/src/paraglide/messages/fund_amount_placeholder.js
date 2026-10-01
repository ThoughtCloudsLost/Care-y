/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Amount_PlaceholderInputs */

const en_fund_amount_placeholder = /** @type {(inputs: Fund_Amount_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`0.00`)
};

const es_fund_amount_placeholder = /** @type {(inputs: Fund_Amount_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`0,00`)
};

const en_xa2_fund_amount_placeholder = /** @type {(inputs: Fund_Amount_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦0.00 ••⟧`)
};

/**
* | output |
* | --- |
* | "0.00" |
*
* @param {Fund_Amount_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_amount_placeholder = /** @type {((inputs?: Fund_Amount_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Amount_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_amount_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_fund_amount_placeholder(inputs)
	return en_fund_amount_placeholder(inputs)
});