/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Access_CallInputs */

const en_vol_access_call = /** @type {(inputs: Vol_Access_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call and text clients`)
};

const es_vol_access_call = /** @type {(inputs: Vol_Access_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamar y enviar mensajes a clientes`)
};

/**
* | output |
* | --- |
* | "Call and text clients" |
*
* @param {Vol_Access_CallInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_access_call = /** @type {((inputs?: Vol_Access_CallInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Access_CallInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_access_call(inputs)
	return es_vol_access_call(inputs)
});