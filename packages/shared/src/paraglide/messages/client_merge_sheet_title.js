/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Clients: NonNullable<unknown> }} Client_Merge_Sheet_TitleInputs */

const en_client_merge_sheet_title = /** @type {(inputs: Client_Merge_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Merge ${i?.Clients}`)
};

const es_client_merge_sheet_title = /** @type {(inputs: Client_Merge_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Fusionar ${i?.Clients}`)
};

/**
* | output |
* | --- |
* | "Merge {Clients}" |
*
* @param {Client_Merge_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_sheet_title = /** @type {((inputs: Client_Merge_Sheet_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Sheet_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_sheet_title(inputs)
	return es_client_merge_sheet_title(inputs)
});