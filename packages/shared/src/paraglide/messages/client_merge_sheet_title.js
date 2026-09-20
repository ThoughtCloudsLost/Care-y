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

const en_xa2_client_merge_sheet_title = /** @type {(inputs: Client_Merge_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Mèrgè  ••${i?.Clients}⟧`)
};

/**
* | output |
* | --- |
* | "Merge {Clients}" |
*
* @param {Client_Merge_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_sheet_title = /** @type {((inputs: Client_Merge_Sheet_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Sheet_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_merge_sheet_title(inputs)
	if (locale === "en-XA") return en_xa2_client_merge_sheet_title(inputs)
	return en_client_merge_sheet_title(inputs)
});