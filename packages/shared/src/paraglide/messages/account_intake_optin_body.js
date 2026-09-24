/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Intake_Optin_BodyInputs */

const en_account_intake_optin_body = /** @type {(inputs: Account_Intake_Optin_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Read replies here with a password.`)
};

const es_account_intake_optin_body = /** @type {(inputs: Account_Intake_Optin_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lee las respuestas aquí con una contraseña.`)
};

const en_xa2_account_intake_optin_body = /** @type {(inputs: Account_Intake_Optin_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèàd rèplìès hèrè wìth à pàsswòrd. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Read replies here with a password." |
*
* @param {Account_Intake_Optin_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_intake_optin_body = /** @type {((inputs?: Account_Intake_Optin_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Intake_Optin_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_intake_optin_body(inputs)
	if (locale === "en-XA") return en_xa2_account_intake_optin_body(inputs)
	return en_account_intake_optin_body(inputs)
});