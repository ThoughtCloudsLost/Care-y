/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_ClientsInputs */

const en_permission_view_clients = /** @type {(inputs: Permission_View_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View clients`)
};

const es_permission_view_clients = /** @type {(inputs: Permission_View_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver clientes`)
};

const en_xa2_permission_view_clients = /** @type {(inputs: Permission_View_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw clìènts ••••⟧`)
};

/**
* | output |
* | --- |
* | "View clients" |
*
* @param {Permission_View_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_clients = /** @type {((inputs?: Permission_View_ClientsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_ClientsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_clients(inputs)
	if (locale === "en-XA") return en_xa2_permission_view_clients(inputs)
	return en_permission_view_clients(inputs)
});