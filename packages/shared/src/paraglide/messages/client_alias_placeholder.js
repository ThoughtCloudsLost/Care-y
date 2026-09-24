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

const en_xa2_client_alias_placeholder = /** @type {(inputs: Client_Alias_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr àn àlìàs •••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter an alias" |
*
* @param {Client_Alias_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_alias_placeholder = /** @type {((inputs?: Client_Alias_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Alias_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_alias_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_client_alias_placeholder(inputs)
	return en_client_alias_placeholder(inputs)
});