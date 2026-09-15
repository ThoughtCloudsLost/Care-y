/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Reset_Client_LoginInputs */

const en_permission_reset_client_login = /** @type {(inputs: Permission_Reset_Client_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset a client's portal login`)
};

const es_permission_reset_client_login = /** @type {(inputs: Permission_Reset_Client_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restablecer el acceso de un cliente al portal`)
};

/**
* | output |
* | --- |
* | "Reset a client's portal login" |
*
* @param {Permission_Reset_Client_LoginInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_reset_client_login = /** @type {((inputs?: Permission_Reset_Client_LoginInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Reset_Client_LoginInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_reset_client_login(inputs)
	return en_permission_reset_client_login(inputs)
});