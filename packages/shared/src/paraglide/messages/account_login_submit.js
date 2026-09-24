/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Login_SubmitInputs */

const en_account_login_submit = /** @type {(inputs: Account_Login_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in`)
};

const es_account_login_submit = /** @type {(inputs: Account_Login_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Iniciar sesión`)
};

const en_xa2_account_login_submit = /** @type {(inputs: Account_Login_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgn ìn •••⟧`)
};

/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Account_Login_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_login_submit = /** @type {((inputs?: Account_Login_SubmitInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Login_SubmitInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_login_submit(inputs)
	if (locale === "en-XA") return en_xa2_account_login_submit(inputs)
	return en_account_login_submit(inputs)
});