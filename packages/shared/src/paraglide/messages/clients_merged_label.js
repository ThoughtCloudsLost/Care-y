/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Merged_LabelInputs */

const en_clients_merged_label = /** @type {(inputs: Clients_Merged_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merged`)
};

const es_clients_merged_label = /** @type {(inputs: Clients_Merged_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fusionado`)
};

const en_xa2_clients_merged_label = /** @type {(inputs: Clients_Merged_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèrgèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Merged" |
*
* @param {Clients_Merged_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_merged_label = /** @type {((inputs?: Clients_Merged_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Merged_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_clients_merged_label(inputs)
	if (locale === "en-XA") return en_xa2_clients_merged_label(inputs)
	return en_clients_merged_label(inputs)
});