/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_New_PasswordInputs */

const en_account_new_password = /** @type {(inputs: Account_New_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New password`)
};

const es_account_new_password = /** @type {(inputs: Account_New_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nueva contraseña`)
};

/**
* | output |
* | --- |
* | "New password" |
*
* @param {Account_New_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_new_password = /** @type {((inputs?: Account_New_PasswordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_New_PasswordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_new_password(inputs)
	return es_account_new_password(inputs)
});