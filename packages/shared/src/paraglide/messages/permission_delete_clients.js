/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Delete_ClientsInputs */

const en_permission_delete_clients = /** @type {(inputs: Permission_Delete_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete clients`)
};

const es_permission_delete_clients = /** @type {(inputs: Permission_Delete_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar clientes`)
};

const en_xa2_permission_delete_clients = /** @type {(inputs: Permission_Delete_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè clìènts •••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete clients" |
*
* @param {Permission_Delete_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_delete_clients = /** @type {((inputs?: Permission_Delete_ClientsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Delete_ClientsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_delete_clients(inputs)
	if (locale === "en-XA") return en_xa2_permission_delete_clients(inputs)
	return en_permission_delete_clients(inputs)
});