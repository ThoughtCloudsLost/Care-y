/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown>, Client: NonNullable<unknown> }} Error_Primary_Client_Not_FoundInputs */

const en_error_primary_client_not_found = /** @type {(inputs: Error_Primary_Client_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Primary ${i?.client} not found.`)
};

const es_error_primary_client_not_found = /** @type {(inputs: Error_Primary_Client_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} principal no encontrado.`)
};

const en_xa2_error_primary_client_not_found = /** @type {(inputs: Error_Primary_Client_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Prìmàry  •••${i?.client} nòt fòùnd. ••••⟧`)
};

/**
* | output |
* | --- |
* | "Primary {client} not found." |
*
* @param {Error_Primary_Client_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_primary_client_not_found = /** @type {((inputs: Error_Primary_Client_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Primary_Client_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_primary_client_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_primary_client_not_found(inputs)
	return en_error_primary_client_not_found(inputs)
});