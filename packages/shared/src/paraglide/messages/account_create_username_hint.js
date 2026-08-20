/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Create_Username_HintInputs */

const en_account_create_username_hint = /** @type {(inputs: Account_Create_Username_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pick a username you can remember. It does not have to be your real name.`)
};

const es_account_create_username_hint = /** @type {(inputs: Account_Create_Username_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elige un nombre de usuario que puedas recordar. No tiene que ser tu nombre real.`)
};

/**
* | output |
* | --- |
* | "Pick a username you can remember. It does not have to be your real name." |
*
* @param {Account_Create_Username_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_create_username_hint = /** @type {((inputs?: Account_Create_Username_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Create_Username_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_create_username_hint(inputs)
	return es_account_create_username_hint(inputs)
});