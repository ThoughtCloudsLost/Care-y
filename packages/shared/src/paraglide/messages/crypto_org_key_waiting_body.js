/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Crypto_Org_Key_Waiting_BodyInputs */

const en_crypto_org_key_waiting_body = /** @type {(inputs: Crypto_Org_Key_Waiting_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your account was created, but an administrator needs to distribute the organization encryption key to you. This usually happens automatically within a few seconds when an admin is online.`)
};

const es_crypto_org_key_waiting_body = /** @type {(inputs: Crypto_Org_Key_Waiting_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu cuenta fue creada, pero un administrador necesita distribuir la clave de cifrado de la organizacion. Esto generalmente ocurre automaticamente en pocos segundos cuando un administrador esta en linea.`)
};

/**
* | output |
* | --- |
* | "Your account was created, but an administrator needs to distribute the organization encryption key to you. This usually happens automatically within a few se..." |
*
* @param {Crypto_Org_Key_Waiting_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const crypto_org_key_waiting_body = /** @type {((inputs?: Crypto_Org_Key_Waiting_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Crypto_Org_Key_Waiting_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_crypto_org_key_waiting_body(inputs)
	return es_crypto_org_key_waiting_body(inputs)
});