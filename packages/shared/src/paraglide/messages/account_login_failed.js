/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Login_FailedInputs */

const en_account_login_failed = /** @type {(inputs: Account_Login_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`That username and password did not match. Check them and try again.`)
};

const es_account_login_failed = /** @type {(inputs: Account_Login_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El nombre de usuario y la contraseña no coinciden. Revísalos e inténtalo de nuevo.`)
};

const en_xa2_account_login_failed = /** @type {(inputs: Account_Login_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thàt ùsèrnàmè ànd pàsswòrd dìd nòt màtch. Chèck thèm ànd try àgàìn. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "That username and password did not match. Check them and try again." |
*
* @param {Account_Login_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_login_failed = /** @type {((inputs?: Account_Login_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Login_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_login_failed(inputs)
	if (locale === "en-XA") return en_xa2_account_login_failed(inputs)
	return en_account_login_failed(inputs)
});