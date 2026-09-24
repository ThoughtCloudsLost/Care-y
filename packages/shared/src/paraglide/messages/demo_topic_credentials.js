/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_CredentialsInputs */

const en_demo_topic_credentials = /** @type {(inputs: Demo_Topic_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Credentials`)
};

const es_demo_topic_credentials = /** @type {(inputs: Demo_Topic_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Credenciales`)
};

const en_xa2_demo_topic_credentials = /** @type {(inputs: Demo_Topic_CredentialsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèdèntìàls ••••⟧`)
};

/**
* | output |
* | --- |
* | "Credentials" |
*
* @param {Demo_Topic_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_credentials = /** @type {((inputs?: Demo_Topic_CredentialsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_CredentialsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_credentials(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_credentials(inputs)
	return en_demo_topic_credentials(inputs)
});