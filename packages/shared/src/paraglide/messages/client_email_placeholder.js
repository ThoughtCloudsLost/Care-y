/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Email_PlaceholderInputs */

const en_client_email_placeholder = /** @type {(inputs: Client_Email_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`name@example.com`)
};

const es_client_email_placeholder = /** @type {(inputs: Client_Email_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`nombre@ejemplo.com`)
};

/**
* | output |
* | --- |
* | "name@example.com" |
*
* @param {Client_Email_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_placeholder = /** @type {((inputs?: Client_Email_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Email_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_email_placeholder(inputs)
	return en_client_email_placeholder(inputs)
});