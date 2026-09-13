/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Create_Password_HintInputs */

const en_account_create_password_hint = /** @type {(inputs: Account_Create_Password_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Use 8 or more characters. A few random words are easy to remember and hard to guess.`)
};

const es_account_create_password_hint = /** @type {(inputs: Account_Create_Password_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usa 8 caracteres o más. Unas cuantas palabras al azar son fáciles de recordar y difíciles de adivinar.`)
};

/**
* | output |
* | --- |
* | "Use 8 or more characters. A few random words are easy to remember and hard to guess." |
*
* @param {Account_Create_Password_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_create_password_hint = /** @type {((inputs?: Account_Create_Password_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Create_Password_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_create_password_hint(inputs)
	return es_account_create_password_hint(inputs)
});