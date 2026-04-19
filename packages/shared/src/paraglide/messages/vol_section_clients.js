/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Section_ClientsInputs */

const en_vol_section_clients = /** @type {(inputs: Vol_Section_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How Clients Are Protected`)
};

const es_vol_section_clients = /** @type {(inputs: Vol_Section_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Como Estan Protegidos los Clientes`)
};

/**
* | output |
* | --- |
* | "How Clients Are Protected" |
*
* @param {Vol_Section_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_section_clients = /** @type {((inputs?: Vol_Section_ClientsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Section_ClientsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_section_clients(inputs)
	return es_vol_section_clients(inputs)
});