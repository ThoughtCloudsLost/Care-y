/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Crypto_Org_Key_PendingInputs */

const en_crypto_org_key_pending = /** @type {(inputs: Crypto_Org_Key_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your encryption keys are being set up by an administrator. Some content may not be visible yet.`)
};

const es_crypto_org_key_pending = /** @type {(inputs: Crypto_Org_Key_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un administrador esta configurando tus claves de cifrado. Es posible que parte del contenido aún no sea visible.`)
};

const en_xa2_crypto_org_key_pending = /** @type {(inputs: Crypto_Org_Key_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr èncryptìòn kèys àrè bèìng sèt ùp by àn àdmìnìstràtòr. Sòmè còntènt mày nòt bè vìsìblè yèt. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your encryption keys are being set up by an administrator. Some content may not be visible yet." |
*
* @param {Crypto_Org_Key_PendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_pending = /** @type {((inputs?: Crypto_Org_Key_PendingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Crypto_Org_Key_PendingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_crypto_org_key_pending(inputs)
	if (locale === "en-XA") return en_xa2_crypto_org_key_pending(inputs)
	return en_crypto_org_key_pending(inputs)
});