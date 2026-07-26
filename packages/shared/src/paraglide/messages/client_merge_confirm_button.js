/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Clients: NonNullable<unknown> }} Client_Merge_Confirm_ButtonInputs */

const en_client_merge_confirm_button = /** @type {(inputs: Client_Merge_Confirm_ButtonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Merge ${i?.Clients}`)
};

const es_client_merge_confirm_button = /** @type {(inputs: Client_Merge_Confirm_ButtonInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Fusionar ${i?.Clients}`)
};

/**
* | output |
* | --- |
* | "Merge {Clients}" |
*
* @param {Client_Merge_Confirm_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_confirm_button = /** @type {((inputs: Client_Merge_Confirm_ButtonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Confirm_ButtonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_confirm_button(inputs)
	return es_client_merge_confirm_button(inputs)
});