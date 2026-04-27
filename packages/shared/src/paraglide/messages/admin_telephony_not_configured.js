/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Not_ConfiguredInputs */

const en_admin_telephony_not_configured = /** @type {(inputs: Admin_Telephony_Not_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone service not set up`)
};

const es_admin_telephony_not_configured = /** @type {(inputs: Admin_Telephony_Not_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Servicio telefonico no configurado`)
};

/**
* | output |
* | --- |
* | "Phone service not set up" |
*
* @param {Admin_Telephony_Not_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_not_configured = /** @type {((inputs?: Admin_Telephony_Not_ConfiguredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Not_ConfiguredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_not_configured(inputs)
	return es_admin_telephony_not_configured(inputs)
});