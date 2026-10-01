/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Recompute_ActionInputs */

const en_fund_recompute_action = /** @type {(inputs: Fund_Recompute_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recompute from ledger`)
};

const es_fund_recompute_action = /** @type {(inputs: Fund_Recompute_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recalcular a partir del registro`)
};

const en_xa2_fund_recompute_action = /** @type {(inputs: Fund_Recompute_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòmpùtè fròm lèdgèr •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Recompute from ledger" |
*
* @param {Fund_Recompute_ActionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_recompute_action = /** @type {((inputs?: Fund_Recompute_ActionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Recompute_ActionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_recompute_action(inputs)
	if (locale === "en-XA") return en_xa2_fund_recompute_action(inputs)
	return en_fund_recompute_action(inputs)
});