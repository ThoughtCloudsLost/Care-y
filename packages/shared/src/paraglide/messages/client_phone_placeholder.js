/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_PlaceholderInputs */

const en_client_phone_placeholder = /** @type {(inputs: Client_Phone_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+1 555 000 1234`)
};

const es_client_phone_placeholder = /** @type {(inputs: Client_Phone_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`+1 555 000 1234`)
};

/**
* | output |
* | --- |
* | "+1 555 000 1234" |
*
* @param {Client_Phone_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_placeholder = /** @type {((inputs?: Client_Phone_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_phone_placeholder(inputs)
	return es_client_phone_placeholder(inputs)
});