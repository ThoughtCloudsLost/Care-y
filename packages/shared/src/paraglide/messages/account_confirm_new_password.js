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

const en_xa2_account_confirm_new_password = /** @type {(inputs: Account_Confirm_New_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìrm nèw pàsswòrd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Confirm new password" |
*
* @param {Account_Confirm_New_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_confirm_new_password = /** @type {((inputs?: Account_Confirm_New_PasswordInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Confirm_New_PasswordInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_confirm_new_password(inputs)
	if (locale === "en-XA") return en_xa2_account_confirm_new_password(inputs)
	return en_account_confirm_new_password(inputs)
});