/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Alias_Uniqueness_ErrorInputs */

const en_client_alias_uniqueness_error = /** @type {(inputs: Client_Alias_Uniqueness_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This alias is already in use`)
};

const es_client_alias_uniqueness_error = /** @type {(inputs: Client_Alias_Uniqueness_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este alias ya está en uso`)
};

const en_xa2_client_alias_uniqueness_error = /** @type {(inputs: Client_Alias_Uniqueness_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs àlìàs ìs àlrèàdy ìn ùsè •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This alias is already in use" |
*
* @param {Client_Alias_Uniqueness_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_alias_uniqueness_error = /** @type {((inputs?: Client_Alias_Uniqueness_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Alias_Uniqueness_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_alias_uniqueness_error(inputs)
	if (locale === "en-XA") return en_xa2_client_alias_uniqueness_error(inputs)
	return en_client_alias_uniqueness_error(inputs)
});