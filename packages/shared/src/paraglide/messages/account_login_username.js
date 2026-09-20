/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Login_UsernameInputs */

const en_account_login_username = /** @type {(inputs: Account_Login_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Username`)
};

const es_account_login_username = /** @type {(inputs: Account_Login_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre de usuario`)
};

const en_xa2_account_login_username = /** @type {(inputs: Account_Login_UsernameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèrnàmè •••⟧`)
};

/**
* | output |
* | --- |
* | "Username" |
*
* @param {Account_Login_UsernameInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_login_username = /** @type {((inputs?: Account_Login_UsernameInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Login_UsernameInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_login_username(inputs)
	if (locale === "en-XA") return en_xa2_account_login_username(inputs)
	return en_account_login_username(inputs)
});