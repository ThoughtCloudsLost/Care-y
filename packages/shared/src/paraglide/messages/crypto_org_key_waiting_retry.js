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

const en_xa2_crypto_org_key_waiting_retry = /** @type {(inputs: Crypto_Org_Key_Waiting_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chèckìng... ••••⟧`)
};

/**
* | output |
* | --- |
* | "Checking..." |
*
* @param {Crypto_Org_Key_Waiting_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_waiting_retry = /** @type {((inputs?: Crypto_Org_Key_Waiting_RetryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Crypto_Org_Key_Waiting_RetryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_crypto_org_key_waiting_retry(inputs)
	if (locale === "en-XA") return en_xa2_crypto_org_key_waiting_retry(inputs)
	return en_crypto_org_key_waiting_retry(inputs)
});