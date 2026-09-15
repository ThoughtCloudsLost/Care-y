/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Password_HeadingInputs */

const en_demo_narrative_client_account_password_heading = /** @type {(inputs: Demo_Narrative_Client_Account_Password_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change password`)
};

const es_demo_narrative_client_account_password_heading = /** @type {(inputs: Demo_Narrative_Client_Account_Password_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar contraseña`)
};

/**
* | output |
* | --- |
* | "Change password" |
*
* @param {Demo_Narrative_Client_Account_Password_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_password_heading = /** @type {((inputs?: Demo_Narrative_Client_Account_Password_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Password_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_password_heading(inputs)
	return en_demo_narrative_client_account_password_heading(inputs)
});