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

const en_xa2_account_unlocking = /** @type {(inputs: Account_UnlockingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnlòckìng yòùr mèssàgès... ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Unlocking your messages..." |
*
* @param {Account_UnlockingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_unlocking = /** @type {((inputs?: Account_UnlockingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_UnlockingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_unlocking(inputs)
	if (locale === "en-XA") return en_xa2_account_unlocking(inputs)
	return en_account_unlocking(inputs)
});