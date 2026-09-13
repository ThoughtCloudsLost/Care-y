/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Signed_OutInputs */

const en_account_signed_out = /** @type {(inputs: Account_Signed_OutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You were signed out to protect your messages. Sign in to continue.`)
};

const es_account_signed_out = /** @type {(inputs: Account_Signed_OutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se cerró tu sesión para proteger tus mensajes. Inicia sesión para continuar.`)
};

/**
* | output |
* | --- |
* | "You were signed out to protect your messages. Sign in to continue." |
*
* @param {Account_Signed_OutInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_signed_out = /** @type {((inputs?: Account_Signed_OutInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Signed_OutInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_signed_out(inputs)
	return es_account_signed_out(inputs)
});