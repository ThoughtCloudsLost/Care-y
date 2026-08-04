/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_ClientsInputs */

const en_permission_view_clients = /** @type {(inputs: Permission_View_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View client records`)
};

const es_permission_view_clients = /** @type {(inputs: Permission_View_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver registros de clientes`)
};

/**
* | output |
* | --- |
* | "View client records" |
*
* @param {Permission_View_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_view_clients = /** @type {((inputs?: Permission_View_ClientsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_ClientsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_view_clients(inputs)
	return es_permission_view_clients(inputs)
});