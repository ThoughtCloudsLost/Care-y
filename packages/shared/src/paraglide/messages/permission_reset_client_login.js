/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Reset_Client_LoginInputs */

const en_permission_reset_client_login = /** @type {(inputs: Permission_Reset_Client_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset client login`)
};

const es_permission_reset_client_login = /** @type {(inputs: Permission_Reset_Client_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restablecer acceso del cliente`)
};

const en_xa2_permission_reset_client_login = /** @type {(inputs: Permission_Reset_Client_LoginInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsèt clìènt lògìn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reset client login" |
*
* @param {Permission_Reset_Client_LoginInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_reset_client_login = /** @type {((inputs?: Permission_Reset_Client_LoginInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Reset_Client_LoginInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_reset_client_login(inputs)
	if (locale === "en-XA") return en_xa2_permission_reset_client_login(inputs)
	return en_permission_reset_client_login(inputs)
});