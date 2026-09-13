/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Create_SubmitInputs */

const en_account_create_submit = /** @type {(inputs: Account_Create_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create account`)
};

const es_account_create_submit = /** @type {(inputs: Account_Create_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear cuenta`)
};

/**
* | output |
* | --- |
* | "Create account" |
*
* @param {Account_Create_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_create_submit = /** @type {((inputs?: Account_Create_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Create_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_create_submit(inputs)
	return es_account_create_submit(inputs)
});