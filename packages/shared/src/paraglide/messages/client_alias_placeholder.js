/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Alias_PlaceholderInputs */

const en_client_alias_placeholder = /** @type {(inputs: Client_Alias_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter an alias`)
};

const es_client_alias_placeholder = /** @type {(inputs: Client_Alias_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingresa un alias`)
};

/**
* | output |
* | --- |
* | "Enter an alias" |
*
* @param {Client_Alias_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_alias_placeholder = /** @type {((inputs?: Client_Alias_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Alias_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_alias_placeholder(inputs)
	return es_client_alias_placeholder(inputs)
});