/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Account_TitleInputs */

const en_demo_section_client_account_title = /** @type {(inputs: Demo_Section_Client_Account_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Client account`)
};

const es_demo_section_client_account_title = /** @type {(inputs: Demo_Section_Client_Account_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuenta de cliente`)
};

const en_xa2_demo_section_client_account_title = /** @type {(inputs: Demo_Section_Client_Account_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clìènt àccòùnt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Client account" |
*
* @param {Demo_Section_Client_Account_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_account_title = /** @type {((inputs?: Demo_Section_Client_Account_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Account_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_account_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_client_account_title(inputs)
	return en_demo_section_client_account_title(inputs)
});