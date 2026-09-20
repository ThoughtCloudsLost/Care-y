/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Merge_ClientsInputs */

const en_permission_merge_clients = /** @type {(inputs: Permission_Merge_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merge clients`)
};

const es_permission_merge_clients = /** @type {(inputs: Permission_Merge_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fusionar clientes`)
};

const en_xa2_permission_merge_clients = /** @type {(inputs: Permission_Merge_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèrgè clìènts ••••⟧`)
};

/**
* | output |
* | --- |
* | "Merge clients" |
*
* @param {Permission_Merge_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_merge_clients = /** @type {((inputs?: Permission_Merge_ClientsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Merge_ClientsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_merge_clients(inputs)
	if (locale === "en-XA") return en_xa2_permission_merge_clients(inputs)
	return en_permission_merge_clients(inputs)
});