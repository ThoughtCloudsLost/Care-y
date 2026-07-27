/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Passkey_BodyInputs */

const en_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A passkey asks your device to sign a one time challenge with a private key that never leaves it. Your fingerprint or face unlocks the signature locally. There is no code to type and nothing to phish, because the signature is only valid for this site and this login attempt.`)
};

const es_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una passkey pide a tu dispositivo firmar un desafio de un solo uso con una clave privada que nunca sale de el. Tu huella o tu rostro desbloquea la firma localmente. No hay codigo que escribir y nada que suplantar, porque la firma solo es valida para este sitio y este intento de inicio de sesion.`)
};

/**
* | output |
* | --- |
* | "A passkey asks your device to sign a one time challenge with a private key that never leaves it. Your fingerprint or face unlocks the signature locally. Ther..." |
*
* @param {Demo_Narrative_Topic_Twofa_Passkey_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_passkey_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_passkey_body(inputs)
	return es_demo_narrative_topic_twofa_passkey_body(inputs)
});