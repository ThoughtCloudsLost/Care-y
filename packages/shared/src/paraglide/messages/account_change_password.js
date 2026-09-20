/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Change_PasswordInputs */

const en_account_change_password = /** @type {(inputs: Account_Change_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save new password`)
};

const es_account_change_password = /** @type {(inputs: Account_Change_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar nueva contraseña`)
};

const en_xa2_account_change_password = /** @type {(inputs: Account_Change_PasswordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè nèw pàsswòrd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Save new password" |
*
* @param {Account_Change_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_change_password = /** @type {((inputs?: Account_Change_PasswordInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Change_PasswordInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_change_password(inputs)
	if (locale === "en-XA") return en_xa2_account_change_password(inputs)
	return en_account_change_password(inputs)
});