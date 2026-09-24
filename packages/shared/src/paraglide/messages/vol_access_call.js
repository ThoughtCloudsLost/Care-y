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

const en_xa2_vol_access_call = /** @type {(inputs: Vol_Access_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll ànd tèxt clìènts •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Call and text clients" |
*
* @param {Vol_Access_CallInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_access_call = /** @type {((inputs?: Vol_Access_CallInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Access_CallInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_access_call(inputs)
	if (locale === "en-XA") return en_xa2_vol_access_call(inputs)
	return en_vol_access_call(inputs)
});