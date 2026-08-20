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

/**
* | output |
* | --- |
* | "Add a secure account (optional)" |
*
* @param {Account_Intake_Optin_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_intake_optin_title = /** @type {((inputs?: Account_Intake_Optin_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Intake_Optin_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_intake_optin_title(inputs)
	return es_account_intake_optin_title(inputs)
});