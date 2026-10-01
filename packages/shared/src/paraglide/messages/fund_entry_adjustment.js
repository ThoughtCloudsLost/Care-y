/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Entry_AdjustmentInputs */

const en_fund_entry_adjustment = /** @type {(inputs: Fund_Entry_AdjustmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adjustment`)
};

const es_fund_entry_adjustment = /** @type {(inputs: Fund_Entry_AdjustmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ajuste`)
};

const en_xa2_fund_entry_adjustment = /** @type {(inputs: Fund_Entry_AdjustmentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdjùstmènt •••⟧`)
};

/**
* | output |
* | --- |
* | "Adjustment" |
*
* @param {Fund_Entry_AdjustmentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_adjustment = /** @type {((inputs?: Fund_Entry_AdjustmentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Entry_AdjustmentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_entry_adjustment(inputs)
	if (locale === "en-XA") return en_xa2_fund_entry_adjustment(inputs)
	return en_fund_entry_adjustment(inputs)
});