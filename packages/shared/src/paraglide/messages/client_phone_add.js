/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_AddInputs */

const en_client_phone_add = /** @type {(inputs: Client_Phone_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add phone`)
};

const es_client_phone_add = /** @type {(inputs: Client_Phone_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Añadir teléfono`)
};

const en_xa2_client_phone_add = /** @type {(inputs: Client_Phone_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd phònè •••⟧`)
};

/**
* | output |
* | --- |
* | "Add phone" |
*
* @param {Client_Phone_AddInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_add = /** @type {((inputs?: Client_Phone_AddInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_AddInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_phone_add(inputs)
	if (locale === "en-XA") return en_xa2_client_phone_add(inputs)
	return en_client_phone_add(inputs)
});