/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Passkey_BodyInputs */

const en_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A passkey turns the device into the second factor. No code to type, nothing to intercept.
Two forms are supported: a device credential protected by the screen lock (fingerprint, face, or PIN) and a physical security key. In both cases, the device holds a private key that never leaves it. The server stores only the public half and cannot produce a valid signature on its own.
**How it works.** At sign-in, the server sends a one-time challenge. The device signs it, the server verifies the signature, and the challenge is discarded. The signature is bound to both the challenge and the site's origin, so a credential captured on a lookalike domain is worthless here.`)
};

const es_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una passkey convierte el dispositivo en el segundo factor. No hay código que escribir ni nada que interceptar.
Se admiten dos formas: una credencial del dispositivo protegida por su bloqueo de pantalla (huella, rostro o PIN) y una llave de seguridad física. En ambos casos, el dispositivo conserva una clave privada que nunca sale de él. El servidor almacena solo la mitad pública y no puede producir una firma válida por su cuenta.
**Cómo funciona.** Al iniciar sesión, el servidor envía un desafío de un solo uso. El dispositivo lo firma, el servidor verifica la firma y el desafío se descarta. La firma está vinculada tanto al desafío como al origen del sitio, de modo que una credencial capturada en un dominio imitador no tiene valor aquí.`)
};

/**
* | output |
* | --- |
* | "A passkey turns the device into the second factor. No code to type, nothing to intercept. Two forms are supported: a device credential protected by the scree..." |
*
* @param {Demo_Narrative_Topic_Twofa_Passkey_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_passkey_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_passkey_body(inputs)
	return en_demo_narrative_topic_twofa_passkey_body(inputs)
});