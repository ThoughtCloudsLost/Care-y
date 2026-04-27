/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Status_ReadyInputs */

const en_admin_telephony_status_ready = /** @type {(inputs: Admin_Telephony_Status_ReadyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone service active`)
};

const es_admin_telephony_status_ready = /** @type {(inputs: Admin_Telephony_Status_ReadyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Servicio telefonico activo`)
};

/**
* | output |
* | --- |
* | "Phone service active" |
*
* @param {Admin_Telephony_Status_ReadyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_status_ready = /** @type {((inputs?: Admin_Telephony_Status_ReadyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Status_ReadyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_status_ready(inputs)
	return es_admin_telephony_status_ready(inputs)
});