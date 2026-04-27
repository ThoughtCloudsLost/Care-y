/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Data_Retention_TitleInputs */

const en_admin_telephony_data_retention_title = /** @type {(inputs: Admin_Telephony_Data_Retention_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Provider data`)
};

const es_admin_telephony_data_retention_title = /** @type {(inputs: Admin_Telephony_Data_Retention_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Datos del proveedor`)
};

/**
* | output |
* | --- |
* | "Provider data" |
*
* @param {Admin_Telephony_Data_Retention_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_data_retention_title = /** @type {((inputs?: Admin_Telephony_Data_Retention_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Data_Retention_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_data_retention_title(inputs)
	return es_admin_telephony_data_retention_title(inputs)
});