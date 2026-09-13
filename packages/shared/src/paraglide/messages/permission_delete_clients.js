/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Delete_ClientsInputs */

const en_permission_delete_clients = /** @type {(inputs: Permission_Delete_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete client records`)
};

const es_permission_delete_clients = /** @type {(inputs: Permission_Delete_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar registros de clientes`)
};

/**
* | output |
* | --- |
* | "Delete client records" |
*
* @param {Permission_Delete_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_delete_clients = /** @type {((inputs?: Permission_Delete_ClientsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Delete_ClientsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_delete_clients(inputs)
	return es_permission_delete_clients(inputs)
});