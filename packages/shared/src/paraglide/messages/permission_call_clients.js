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

const en_xa2_permission_call_clients = /** @type {(inputs: Permission_Call_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll clìènts ••••⟧`)
};

/**
* | output |
* | --- |
* | "Call clients" |
*
* @param {Permission_Call_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_call_clients = /** @type {((inputs?: Permission_Call_ClientsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Call_ClientsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_call_clients(inputs)
	if (locale === "en-XA") return en_xa2_permission_call_clients(inputs)
	return en_permission_call_clients(inputs)
});