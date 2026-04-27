/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Status_PendingInputs */

const en_admin_telephony_status_pending = /** @type {(inputs: Admin_Telephony_Status_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone service not set up`)
};

const es_admin_telephony_status_pending = /** @type {(inputs: Admin_Telephony_Status_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Servicio telefonico no configurado`)
};

/**
* | output |
* | --- |
* | "Phone service not set up" |
*
* @param {Admin_Telephony_Status_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_status_pending = /** @type {((inputs?: Admin_Telephony_Status_PendingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Status_PendingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_status_pending(inputs)
	return es_admin_telephony_status_pending(inputs)
});