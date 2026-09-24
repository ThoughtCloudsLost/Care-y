/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Crypto_Org_Key_Waiting_BodyInputs */

const en_crypto_org_key_waiting_body = /** @type {(inputs: Crypto_Org_Key_Waiting_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your account was created, but an administrator needs to distribute the organization encryption key to you. This usually happens automatically within a few seconds when an admin is online.`)
};

const es_crypto_org_key_waiting_body = /** @type {(inputs: Crypto_Org_Key_Waiting_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu cuenta fue creada, pero un administrador necesita distribuir la clave de cifrado de la organización. Esto generalmente ocurre automáticamente en pocos segundos cuando un administrador esta en línea.`)
};

const en_xa2_crypto_org_key_waiting_body = /** @type {(inputs: Crypto_Org_Key_Waiting_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr àccòùnt wàs crèàtèd, bùt àn àdmìnìstràtòr nèèds tò dìstrìbùtè thè òrgànìzàtìòn èncryptìòn kèy tò yòù. Thìs ùsùàlly hàppèns àùtòmàtìcàlly wìthìn à fèw sècònds whèn àn àdmìn ìs ònlìnè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your account was created, but an administrator needs to distribute the organization encryption key to you. This usually happens automatically within a few se..." |
*
* @param {Crypto_Org_Key_Waiting_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_waiting_body = /** @type {((inputs?: Crypto_Org_Key_Waiting_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Crypto_Org_Key_Waiting_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_crypto_org_key_waiting_body(inputs)
	if (locale === "en-XA") return en_xa2_crypto_org_key_waiting_body(inputs)
	return en_crypto_org_key_waiting_body(inputs)
});