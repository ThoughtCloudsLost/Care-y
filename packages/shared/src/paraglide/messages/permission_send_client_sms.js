/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Send_Client_SmsInputs */

const en_permission_send_client_sms = /** @type {(inputs: Permission_Send_Client_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send client SMS`)
};

const es_permission_send_client_sms = /** @type {(inputs: Permission_Send_Client_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar SMS al cliente`)
};

const en_xa2_permission_send_client_sms = /** @type {(inputs: Permission_Send_Client_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd clìènt SMS •••••⟧`)
};

/**
* | output |
* | --- |
* | "Send client SMS" |
*
* @param {Permission_Send_Client_SmsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_send_client_sms = /** @type {((inputs?: Permission_Send_Client_SmsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Send_Client_SmsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_send_client_sms(inputs)
	if (locale === "en-XA") return en_xa2_permission_send_client_sms(inputs)
	return en_permission_send_client_sms(inputs)
});