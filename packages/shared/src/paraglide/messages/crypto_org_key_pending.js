/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Crypto_Org_Key_PendingInputs */

const en_crypto_org_key_pending = /** @type {(inputs: Crypto_Org_Key_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your encryption keys are being set up by an administrator. Some content may not be visible yet.`)
};

const es_crypto_org_key_pending = /** @type {(inputs: Crypto_Org_Key_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un administrador esta configurando tus claves de cifrado. Es posible que parte del contenido aun no sea visible.`)
};

/**
* | output |
* | --- |
* | "Your encryption keys are being set up by an administrator. Some content may not be visible yet." |
*
* @param {Crypto_Org_Key_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_pending = /** @type {((inputs?: Crypto_Org_Key_PendingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Crypto_Org_Key_PendingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_crypto_org_key_pending(inputs)
	return es_crypto_org_key_pending(inputs)
});