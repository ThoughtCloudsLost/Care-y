/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Create_MismatchInputs */

const en_account_create_mismatch = /** @type {(inputs: Account_Create_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Passwords do not match.`)
};

const es_account_create_mismatch = /** @type {(inputs: Account_Create_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las contraseñas no coinciden.`)
};

const en_xa2_account_create_mismatch = /** @type {(inputs: Account_Create_MismatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrds dò nòt màtch. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Account_Create_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_create_mismatch = /** @type {((inputs?: Account_Create_MismatchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Create_MismatchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_create_mismatch(inputs)
	if (locale === "en-XA") return en_xa2_account_create_mismatch(inputs)
	return en_account_create_mismatch(inputs)
});