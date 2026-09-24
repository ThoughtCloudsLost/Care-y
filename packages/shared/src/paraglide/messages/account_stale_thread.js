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

const en_xa2_account_stale_thread = /** @type {(inputs: Account_Stale_ThreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè cònvèrsàtìòn chàngèd whìlè yòù wèrè sèttìng ùp. Plèàsè try àgàìn. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The conversation changed while you were setting up. Please try again." |
*
* @param {Account_Stale_ThreadInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_stale_thread = /** @type {((inputs?: Account_Stale_ThreadInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Stale_ThreadInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_stale_thread(inputs)
	if (locale === "en-XA") return en_xa2_account_stale_thread(inputs)
	return en_account_stale_thread(inputs)
});