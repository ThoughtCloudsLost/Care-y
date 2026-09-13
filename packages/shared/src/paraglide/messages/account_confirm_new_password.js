/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Confirm_New_PasswordInputs */

const en_account_confirm_new_password = /** @type {(inputs: Account_Confirm_New_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm new password`)
};

const es_account_confirm_new_password = /** @type {(inputs: Account_Confirm_New_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar nueva contraseña`)
};

/**
* | output |
* | --- |
* | "Confirm new password" |
*
* @param {Account_Confirm_New_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_confirm_new_password = /** @type {((inputs?: Account_Confirm_New_PasswordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Confirm_New_PasswordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_confirm_new_password(inputs)
	return es_account_confirm_new_password(inputs)
});