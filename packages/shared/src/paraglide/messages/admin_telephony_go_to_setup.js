/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Go_To_SetupInputs */

const en_admin_telephony_go_to_setup = /** @type {(inputs: Admin_Telephony_Go_To_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up telephony`)
};

const es_admin_telephony_go_to_setup = /** @type {(inputs: Admin_Telephony_Go_To_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar telefonía`)
};

const en_xa2_admin_telephony_go_to_setup = /** @type {(inputs: Admin_Telephony_Go_To_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt ùp tèlèphòny •••••⟧`)
};

/**
* | output |
* | --- |
* | "Set up telephony" |
*
* @param {Admin_Telephony_Go_To_SetupInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_go_to_setup = /** @type {((inputs?: Admin_Telephony_Go_To_SetupInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Go_To_SetupInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_go_to_setup(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_go_to_setup(inputs)
	return en_admin_telephony_go_to_setup(inputs)
});