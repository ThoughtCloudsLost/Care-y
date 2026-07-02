/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Crypto_Org_Key_Waiting_RetryInputs */

const en_crypto_org_key_waiting_retry = /** @type {(inputs: Crypto_Org_Key_Waiting_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Checking...`)
};

const es_crypto_org_key_waiting_retry = /** @type {(inputs: Crypto_Org_Key_Waiting_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificando...`)
};

/**
* | output |
* | --- |
* | "Checking..." |
*
* @param {Crypto_Org_Key_Waiting_RetryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_waiting_retry = /** @type {((inputs?: Crypto_Org_Key_Waiting_RetryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Crypto_Org_Key_Waiting_RetryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_crypto_org_key_waiting_retry(inputs)
	return es_crypto_org_key_waiting_retry(inputs)
});