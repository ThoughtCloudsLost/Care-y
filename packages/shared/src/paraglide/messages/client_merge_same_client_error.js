/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Client_Merge_Same_Client_ErrorInputs */

const en_client_merge_same_client_error = /** @type {(inputs: Client_Merge_Same_Client_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cannot merge a ${i?.client} into itself`)
};

const es_client_merge_same_client_error = /** @type {(inputs: Client_Merge_Same_Client_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se puede fusionar un ${i?.client} consigo mismo`)
};

/**
* | output |
* | --- |
* | "Cannot merge a {client} into itself" |
*
* @param {Client_Merge_Same_Client_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_same_client_error = /** @type {((inputs: Client_Merge_Same_Client_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Same_Client_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_same_client_error(inputs)
	return es_client_merge_same_client_error(inputs)
});