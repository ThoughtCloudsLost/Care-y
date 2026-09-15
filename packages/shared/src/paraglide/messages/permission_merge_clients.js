/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Merge_ClientsInputs */

const en_permission_merge_clients = /** @type {(inputs: Permission_Merge_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merge duplicate client records`)
};

const es_permission_merge_clients = /** @type {(inputs: Permission_Merge_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fusionar registros de clientes duplicados`)
};

/**
* | output |
* | --- |
* | "Merge duplicate client records" |
*
* @param {Permission_Merge_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_merge_clients = /** @type {((inputs?: Permission_Merge_ClientsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Merge_ClientsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_merge_clients(inputs)
	return en_permission_merge_clients(inputs)
});