/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Amount_LabelInputs */

const en_fund_amount_label = /** @type {(inputs: Fund_Amount_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Amount`)
};

const es_fund_amount_label = /** @type {(inputs: Fund_Amount_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Importe`)
};

const en_xa2_fund_amount_label = /** @type {(inputs: Fund_Amount_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àmòùnt ••⟧`)
};

/**
* | output |
* | --- |
* | "Amount" |
*
* @param {Fund_Amount_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_amount_label = /** @type {((inputs?: Fund_Amount_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Amount_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_amount_label(inputs)
	if (locale === "en-XA") return en_xa2_fund_amount_label(inputs)
	return en_fund_amount_label(inputs)
});