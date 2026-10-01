/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Fund_Balance_StaleInputs */

const en_error_fund_balance_stale = /** @type {(inputs: Error_Fund_Balance_StaleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The fund balance changed. Try again.`)
};

const es_error_fund_balance_stale = /** @type {(inputs: Error_Fund_Balance_StaleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El saldo del fondo cambió. Inténtalo de nuevo.`)
};

const en_xa2_error_fund_balance_stale = /** @type {(inputs: Error_Fund_Balance_StaleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè fùnd bàlàncè chàngèd. Try àgàìn. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The fund balance changed. Try again." |
*
* @param {Error_Fund_Balance_StaleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_fund_balance_stale = /** @type {((inputs?: Error_Fund_Balance_StaleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Fund_Balance_StaleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_fund_balance_stale(inputs)
	if (locale === "en-XA") return en_xa2_error_fund_balance_stale(inputs)
	return en_error_fund_balance_stale(inputs)
});