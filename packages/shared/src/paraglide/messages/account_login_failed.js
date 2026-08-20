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

/**
* | output |
* | --- |
* | "That username and password did not match. Check them and try again." |
*
* @param {Account_Login_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_login_failed = /** @type {((inputs?: Account_Login_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Login_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_login_failed(inputs)
	return es_account_login_failed(inputs)
});