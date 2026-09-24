/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Send_Client_EmailInputs */

const en_permission_send_client_email = /** @type {(inputs: Permission_Send_Client_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send client email`)
};

const es_permission_send_client_email = /** @type {(inputs: Permission_Send_Client_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar correo al cliente`)
};

const en_xa2_permission_send_client_email = /** @type {(inputs: Permission_Send_Client_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd clìènt èmàìl ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Send client email" |
*
* @param {Permission_Send_Client_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_send_client_email = /** @type {((inputs?: Permission_Send_Client_EmailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Send_Client_EmailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_send_client_email(inputs)
	if (locale === "en-XA") return en_xa2_permission_send_client_email(inputs)
	return en_permission_send_client_email(inputs)
});