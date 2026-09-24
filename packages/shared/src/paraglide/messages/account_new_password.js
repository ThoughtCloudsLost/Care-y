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

const en_xa2_account_new_password = /** @type {(inputs: Account_New_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw pàsswòrd ••••⟧`)
};

/**
* | output |
* | --- |
* | "New password" |
*
* @param {Account_New_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_new_password = /** @type {((inputs?: Account_New_PasswordInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_New_PasswordInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_new_password(inputs)
	if (locale === "en-XA") return en_xa2_account_new_password(inputs)
	return en_account_new_password(inputs)
});