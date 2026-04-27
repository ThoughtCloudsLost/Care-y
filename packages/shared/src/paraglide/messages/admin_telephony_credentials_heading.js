/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ provider: NonNullable<unknown> }} Admin_Telephony_Credentials_HeadingInputs */

const en_admin_telephony_credentials_heading = /** @type {(inputs: Admin_Telephony_Credentials_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Update ${i?.provider} credentials`)
};

const es_admin_telephony_credentials_heading = /** @type {(inputs: Admin_Telephony_Credentials_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Actualizar credenciales de ${i?.provider}`)
};

/**
* | output |
* | --- |
* | "Update {provider} credentials" |
*
* @param {Admin_Telephony_Credentials_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_credentials_heading = /** @type {((inputs: Admin_Telephony_Credentials_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Credentials_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_credentials_heading(inputs)
	return es_admin_telephony_credentials_heading(inputs)
});