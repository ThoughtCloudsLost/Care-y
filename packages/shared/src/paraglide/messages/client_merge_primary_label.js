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

const en_xa2_client_merge_primary_label = /** @type {(inputs: Client_Merge_Primary_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prìmàry (sùrvìvès) ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Primary (survives)" |
*
* @param {Client_Merge_Primary_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_primary_label = /** @type {((inputs?: Client_Merge_Primary_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Primary_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_merge_primary_label(inputs)
	if (locale === "en-XA") return en_xa2_client_merge_primary_label(inputs)
	return en_client_merge_primary_label(inputs)
});