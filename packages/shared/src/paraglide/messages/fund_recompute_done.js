/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Recompute_DoneInputs */

const en_fund_recompute_done = /** @type {(inputs: Fund_Recompute_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Balance recomputed from the ledger`)
};

const es_fund_recompute_done = /** @type {(inputs: Fund_Recompute_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saldo recalculado a partir del registro`)
};

const en_xa2_fund_recompute_done = /** @type {(inputs: Fund_Recompute_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàlàncè rècòmpùtèd fròm thè lèdgèr •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Balance recomputed from the ledger" |
*
* @param {Fund_Recompute_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_recompute_done = /** @type {((inputs?: Fund_Recompute_DoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Recompute_DoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_recompute_done(inputs)
	if (locale === "en-XA") return en_xa2_fund_recompute_done(inputs)
	return en_fund_recompute_done(inputs)
});