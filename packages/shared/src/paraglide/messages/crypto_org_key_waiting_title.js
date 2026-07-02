/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Crypto_Org_Key_Waiting_TitleInputs */

const en_crypto_org_key_waiting_title = /** @type {(inputs: Crypto_Org_Key_Waiting_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Waiting for Key Distribution`)
};

const es_crypto_org_key_waiting_title = /** @type {(inputs: Crypto_Org_Key_Waiting_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esperando distribucion de claves`)
};

/**
* | output |
* | --- |
* | "Waiting for Key Distribution" |
*
* @param {Crypto_Org_Key_Waiting_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_waiting_title = /** @type {((inputs?: Crypto_Org_Key_Waiting_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Crypto_Org_Key_Waiting_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_crypto_org_key_waiting_title(inputs)
	return es_crypto_org_key_waiting_title(inputs)
});