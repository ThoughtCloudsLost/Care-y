/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Intake_Optin_TitleInputs */

const en_account_intake_optin_title = /** @type {(inputs: Account_Intake_Optin_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a secure account (optional)`)
};

const es_account_intake_optin_title = /** @type {(inputs: Account_Intake_Optin_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar una cuenta segura (opcional)`)
};

const en_xa2_account_intake_optin_title = /** @type {(inputs: Account_Intake_Optin_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd à sècùrè àccòùnt (òptìònàl) ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Add a secure account (optional)" |
*
* @param {Account_Intake_Optin_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_intake_optin_title = /** @type {((inputs?: Account_Intake_Optin_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Intake_Optin_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_intake_optin_title(inputs)
	if (locale === "en-XA") return en_xa2_account_intake_optin_title(inputs)
	return en_account_intake_optin_title(inputs)
});