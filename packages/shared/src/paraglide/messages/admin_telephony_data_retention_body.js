/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Data_Retention_BodyInputs */

const en_admin_telephony_data_retention_body = /** @type {(inputs: Admin_Telephony_Data_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your phone provider keeps its own logs of calls and messages for up to 30 days. CARE-Y requests deletion after processing, but the provider may retain them during that window.`)
};

const es_admin_telephony_data_retention_body = /** @type {(inputs: Admin_Telephony_Data_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su proveedor telefonico conserva sus propios registros de llamadas y mensajes hasta por 30 dias. CARE-Y solicita la eliminacion despues del procesamiento, pero el proveedor puede retenerlos durante ese periodo.`)
};

/**
* | output |
* | --- |
* | "Your phone provider keeps its own logs of calls and messages for up to 30 days. CARE-Y requests deletion after processing, but the provider may retain them d..." |
*
* @param {Admin_Telephony_Data_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_data_retention_body = /** @type {((inputs?: Admin_Telephony_Data_Retention_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Data_Retention_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_data_retention_body(inputs)
	return es_admin_telephony_data_retention_body(inputs)
});