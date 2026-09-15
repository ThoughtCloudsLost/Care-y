/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Sign_In_HeadingInputs */

const en_demo_narrative_client_account_sign_in_heading = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_In_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account sign in`)
};

const es_demo_narrative_client_account_sign_in_heading = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_In_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inicio de sesión de cuenta`)
};

/**
* | output |
* | --- |
* | "Account sign in" |
*
* @param {Demo_Narrative_Client_Account_Sign_In_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_sign_in_heading = /** @type {((inputs?: Demo_Narrative_Client_Account_Sign_In_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Sign_In_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_sign_in_heading(inputs)
	return en_demo_narrative_client_account_sign_in_heading(inputs)
});