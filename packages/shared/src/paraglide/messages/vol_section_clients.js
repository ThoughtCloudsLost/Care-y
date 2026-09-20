/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Section_ClientsInputs */

const en_vol_section_clients = /** @type {(inputs: Vol_Section_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How Clients Are Protected`)
};

const es_vol_section_clients = /** @type {(inputs: Vol_Section_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo Están Protegidos los Clientes`)
};

const en_xa2_vol_section_clients = /** @type {(inputs: Vol_Section_ClientsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòw Clìènts Àrè Pròtèctèd ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "How Clients Are Protected" |
*
* @param {Vol_Section_ClientsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_section_clients = /** @type {((inputs?: Vol_Section_ClientsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Section_ClientsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_section_clients(inputs)
	if (locale === "en-XA") return en_xa2_vol_section_clients(inputs)
	return en_vol_section_clients(inputs)
});