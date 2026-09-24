/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Username_TakenInputs */

const en_account_username_taken = /** @type {(inputs: Account_Username_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That username is already taken. Try a different one.`)
};

const es_account_username_taken = /** @type {(inputs: Account_Username_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ese nombre de usuario ya está en uso. Prueba con otro.`)
};

const en_xa2_account_username_taken = /** @type {(inputs: Account_Username_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thàt ùsèrnàmè ìs àlrèàdy tàkèn. Try à dìffèrènt ònè. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "That username is already taken. Try a different one." |
*
* @param {Account_Username_TakenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_username_taken = /** @type {((inputs?: Account_Username_TakenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Username_TakenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_username_taken(inputs)
	if (locale === "en-XA") return en_xa2_account_username_taken(inputs)
	return en_account_username_taken(inputs)
});