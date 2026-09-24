/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Send_Client_MediaInputs */

const en_permission_send_client_media = /** @type {(inputs: Permission_Send_Client_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send client media`)
};

const es_permission_send_client_media = /** @type {(inputs: Permission_Send_Client_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar archivos al cliente`)
};

const en_xa2_permission_send_client_media = /** @type {(inputs: Permission_Send_Client_MediaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd clìènt mèdìà ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Send client media" |
*
* @param {Permission_Send_Client_MediaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_send_client_media = /** @type {((inputs?: Permission_Send_Client_MediaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Send_Client_MediaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_send_client_media(inputs)
	if (locale === "en-XA") return en_xa2_permission_send_client_media(inputs)
	return en_permission_send_client_media(inputs)
});