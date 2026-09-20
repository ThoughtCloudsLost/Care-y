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

const en_xa2_client_merge_secondary_label = /** @type {(inputs: Client_Merge_Secondary_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècòndàry (mèrgèd ìn) •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Secondary (merged in)" |
*
* @param {Client_Merge_Secondary_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_secondary_label = /** @type {((inputs?: Client_Merge_Secondary_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Secondary_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_merge_secondary_label(inputs)
	if (locale === "en-XA") return en_xa2_client_merge_secondary_label(inputs)
	return en_client_merge_secondary_label(inputs)
});