/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Merge_Primary_LabelInputs */

const en_client_merge_primary_label = /** @type {(inputs: Client_Merge_Primary_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Primary (survives)`)
};

const es_client_merge_primary_label = /** @type {(inputs: Client_Merge_Primary_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Primario (sobrevive)`)
};

/**
* | output |
* | --- |
* | "Primary (survives)" |
*
* @param {Client_Merge_Primary_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_primary_label = /** @type {((inputs?: Client_Merge_Primary_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Primary_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_primary_label(inputs)
	return es_client_merge_primary_label(inputs)
});