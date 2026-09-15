/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Send_Client_EmailInputs */

const en_permission_send_client_email = /** @type {(inputs: Permission_Send_Client_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send emails to clients`)
};

const es_permission_send_client_email = /** @type {(inputs: Permission_Send_Client_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar correos a clientes`)
};

/**
* | output |
* | --- |
* | "Send emails to clients" |
*
* @param {Permission_Send_Client_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_send_client_email = /** @type {((inputs?: Permission_Send_Client_EmailInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Send_Client_EmailInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_send_client_email(inputs)
	return en_permission_send_client_email(inputs)
});