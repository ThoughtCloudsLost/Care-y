/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Send_Client_SmsInputs */

const en_permission_send_client_sms = /** @type {(inputs: Permission_Send_Client_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send text messages to clients`)
};

const es_permission_send_client_sms = /** @type {(inputs: Permission_Send_Client_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar mensajes de texto a clientes`)
};

/**
* | output |
* | --- |
* | "Send text messages to clients" |
*
* @param {Permission_Send_Client_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_send_client_sms = /** @type {((inputs?: Permission_Send_Client_SmsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Send_Client_SmsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_send_client_sms(inputs)
	return en_permission_send_client_sms(inputs)
});