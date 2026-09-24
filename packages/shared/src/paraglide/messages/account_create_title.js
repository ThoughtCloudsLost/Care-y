/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Create_TitleInputs */

const en_account_create_title = /** @type {(inputs: Account_Create_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create account`)
};

const es_account_create_title = /** @type {(inputs: Account_Create_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear cuenta`)
};

const en_xa2_account_create_title = /** @type {(inputs: Account_Create_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè àccòùnt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Create account" |
*
* @param {Account_Create_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_create_title = /** @type {((inputs?: Account_Create_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Create_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_create_title(inputs)
	if (locale === "en-XA") return en_xa2_account_create_title(inputs)
	return en_account_create_title(inputs)
});