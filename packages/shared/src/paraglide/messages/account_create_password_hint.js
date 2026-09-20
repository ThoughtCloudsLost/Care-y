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

const en_xa2_account_create_password_hint = /** @type {(inputs: Account_Create_Password_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsè 8 òr mòrè chàràctèrs. À fèw ràndòm wòrds àrè èàsy tò rèmèmbèr ànd hàrd tò gùèss. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Use 8 or more characters. A few random words are easy to remember and hard to guess." |
*
* @param {Account_Create_Password_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_create_password_hint = /** @type {((inputs?: Account_Create_Password_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Create_Password_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_create_password_hint(inputs)
	if (locale === "en-XA") return en_xa2_account_create_password_hint(inputs)
	return en_account_create_password_hint(inputs)
});