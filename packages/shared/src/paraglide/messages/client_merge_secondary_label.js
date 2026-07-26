/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Merge_Secondary_LabelInputs */

const en_client_merge_secondary_label = /** @type {(inputs: Client_Merge_Secondary_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secondary (merged in)`)
};

const es_client_merge_secondary_label = /** @type {(inputs: Client_Merge_Secondary_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secundario (fusionado)`)
};

/**
* | output |
* | --- |
* | "Secondary (merged in)" |
*
* @param {Client_Merge_Secondary_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_secondary_label = /** @type {((inputs?: Client_Merge_Secondary_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Secondary_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_secondary_label(inputs)
	return es_client_merge_secondary_label(inputs)
});