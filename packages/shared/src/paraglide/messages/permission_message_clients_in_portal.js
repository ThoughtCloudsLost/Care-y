/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Message_Clients_In_PortalInputs */

const en_permission_message_clients_in_portal = /** @type {(inputs: Permission_Message_Clients_In_PortalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Message clients in portal`)
};

const es_permission_message_clients_in_portal = /** @type {(inputs: Permission_Message_Clients_In_PortalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar mensajes en el portal`)
};

/**
* | output |
* | --- |
* | "Message clients in portal" |
*
* @param {Permission_Message_Clients_In_PortalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_message_clients_in_portal = /** @type {((inputs?: Permission_Message_Clients_In_PortalInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Message_Clients_In_PortalInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_message_clients_in_portal(inputs)
	return en_permission_message_clients_in_portal(inputs)
});