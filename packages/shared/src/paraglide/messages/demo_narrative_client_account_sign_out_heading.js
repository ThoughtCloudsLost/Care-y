/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Sign_Out_HeadingInputs */

const en_demo_narrative_client_account_sign_out_heading = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign out`)
};

const es_demo_narrative_client_account_sign_out_heading = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_Out_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar sesión`)
};

/**
* | output |
* | --- |
* | "Sign out" |
*
* @param {Demo_Narrative_Client_Account_Sign_Out_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_sign_out_heading = /** @type {((inputs?: Demo_Narrative_Client_Account_Sign_Out_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Sign_Out_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_sign_out_heading(inputs)
	return en_demo_narrative_client_account_sign_out_heading(inputs)
});