/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Alias_Uniqueness_ErrorInputs */

const en_client_alias_uniqueness_error = /** @type {(inputs: Client_Alias_Uniqueness_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This alias is already in use`)
};

const es_client_alias_uniqueness_error = /** @type {(inputs: Client_Alias_Uniqueness_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este alias ya esta en uso`)
};

/**
* | output |
* | --- |
* | "This alias is already in use" |
*
* @param {Client_Alias_Uniqueness_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_alias_uniqueness_error = /** @type {((inputs?: Client_Alias_Uniqueness_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Alias_Uniqueness_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_alias_uniqueness_error(inputs)
	return es_client_alias_uniqueness_error(inputs)
});