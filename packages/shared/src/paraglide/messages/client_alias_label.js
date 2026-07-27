/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Alias_LabelInputs */

const en_client_alias_label = /** @type {(inputs: Client_Alias_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alias`)
};

const es_client_alias_label = /** @type {(inputs: Client_Alias_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alias`)
};

/**
* | output |
* | --- |
* | "Alias" |
*
* @param {Client_Alias_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_alias_label = /** @type {((inputs?: Client_Alias_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Alias_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_alias_label(inputs)
	return es_client_alias_label(inputs)
});