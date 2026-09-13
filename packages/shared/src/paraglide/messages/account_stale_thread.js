/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Stale_ThreadInputs */

const en_account_stale_thread = /** @type {(inputs: Account_Stale_ThreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The conversation changed while you were setting up. Please try again.`)
};

const es_account_stale_thread = /** @type {(inputs: Account_Stale_ThreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La conversación cambió mientras configurabas tu cuenta. Inténtalo de nuevo.`)
};

/**
* | output |
* | --- |
* | "The conversation changed while you were setting up. Please try again." |
*
* @param {Account_Stale_ThreadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_stale_thread = /** @type {((inputs?: Account_Stale_ThreadInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Stale_ThreadInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_stale_thread(inputs)
	return es_account_stale_thread(inputs)
});