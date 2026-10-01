/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ amount: NonNullable<unknown> }} Fund_Recompute_MismatchInputs */

const en_fund_recompute_mismatch = /** @type {(inputs: Fund_Recompute_MismatchInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`The stored balance does not match the ledger, which adds up to ${i?.amount}.`)
};

const es_fund_recompute_mismatch = /** @type {(inputs: Fund_Recompute_MismatchInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El saldo guardado no coincide con el registro, que suma ${i?.amount}.`)
};

const en_xa2_fund_recompute_mismatch = /** @type {(inputs: Fund_Recompute_MismatchInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thè stòrèd bàlàncè dòès nòt màtch thè lèdgèr, whìch àdds ùp tò  •••••••••••••••••••${i?.amount}. •⟧`)
};

/**
* | output |
* | --- |
* | "The stored balance does not match the ledger, which adds up to {amount}." |
*
* @param {Fund_Recompute_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_recompute_mismatch = /** @type {((inputs: Fund_Recompute_MismatchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Recompute_MismatchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_recompute_mismatch(inputs)
	if (locale === "en-XA") return en_xa2_fund_recompute_mismatch(inputs)
	return en_fund_recompute_mismatch(inputs)
});