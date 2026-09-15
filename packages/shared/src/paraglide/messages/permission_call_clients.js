/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Call_ClientsInputs */

const en_permission_call_clients = /** @type {(inputs: Permission_Call_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call clients`)
};

const es_permission_call_clients = /** @type {(inputs: Permission_Call_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamar a clientes`)
};

/**
* | output |
* | --- |
* | "Call clients" |
*
* @param {Permission_Call_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_call_clients = /** @type {((inputs?: Permission_Call_ClientsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Call_ClientsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_call_clients(inputs)
	return en_permission_call_clients(inputs)
});