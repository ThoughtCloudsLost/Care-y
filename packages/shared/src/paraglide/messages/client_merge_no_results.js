/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ clients: NonNullable<unknown> }} Client_Merge_No_ResultsInputs */

const en_client_merge_no_results = /** @type {(inputs: Client_Merge_No_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No matching ${i?.clients} found`)
};

const es_client_merge_no_results = /** @type {(inputs: Client_Merge_No_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se encontraron ${i?.clients} coincidentes`)
};

const en_xa2_client_merge_no_results = /** @type {(inputs: Client_Merge_No_ResultsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò màtchìng  ••••${i?.clients} fòùnd ••⟧`)
};

/**
* | output |
* | --- |
* | "No matching {clients} found" |
*
* @param {Client_Merge_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_no_results = /** @type {((inputs: Client_Merge_No_ResultsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_No_ResultsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_merge_no_results(inputs)
	if (locale === "en-XA") return en_xa2_client_merge_no_results(inputs)
	return en_client_merge_no_results(inputs)
});