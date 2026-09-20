/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_LogoutInputs */

const en_account_logout = /** @type {(inputs: Account_LogoutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign out`)
};

const es_account_logout = /** @type {(inputs: Account_LogoutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar sesión`)
};

const en_xa2_account_logout = /** @type {(inputs: Account_LogoutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgn òùt •••⟧`)
};

/**
* | output |
* | --- |
* | "Sign out" |
*
* @param {Account_LogoutInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_logout = /** @type {((inputs?: Account_LogoutInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_LogoutInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_logout(inputs)
	if (locale === "en-XA") return en_xa2_account_logout(inputs)
	return en_account_logout(inputs)
});