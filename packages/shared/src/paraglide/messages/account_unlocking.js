/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_UnlockingInputs */

const en_account_unlocking = /** @type {(inputs: Account_UnlockingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlocking your messages...`)
};

const es_account_unlocking = /** @type {(inputs: Account_UnlockingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desbloqueando tus mensajes...`)
};

/**
* | output |
* | --- |
* | "Unlocking your messages..." |
*
* @param {Account_UnlockingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_unlocking = /** @type {((inputs?: Account_UnlockingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_UnlockingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_unlocking(inputs)
	return es_account_unlocking(inputs)
});