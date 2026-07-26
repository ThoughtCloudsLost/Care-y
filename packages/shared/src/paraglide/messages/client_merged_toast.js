/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Clients: NonNullable<unknown> }} Client_Merged_ToastInputs */

const en_client_merged_toast = /** @type {(inputs: Client_Merged_ToastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Clients} merged successfully.`)
};

const es_client_merged_toast = /** @type {(inputs: Client_Merged_ToastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Clients} fusionados exitosamente.`)
};

/**
* | output |
* | --- |
* | "{Clients} merged successfully." |
*
* @param {Client_Merged_ToastInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merged_toast = /** @type {((inputs: Client_Merged_ToastInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merged_ToastInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merged_toast(inputs)
	return es_client_merged_toast(inputs)
});