/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Passkey_BodyInputs */

const en_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A passkey uses the device itself as the second factor. There is no code to type.
**During enrollment,** the device creates a cryptographic key pair and stores the private key in its secure hardware.
**At login,** the volunteer's fingerprint or face unlocks the private key, which signs a one time challenge from the server. The server verifies the signature without ever seeing the private key.
**Phishing resistance.** The signature only works for this specific login attempt on this specific site. An attacker cannot replay it or redirect it to a different server.
**Device loss.** If the device is lost, the volunteer can sign in using another enrolled method and remove the old passkey from Settings.`)
};

const es_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una passkey usa el propio dispositivo como segundo factor. No hay codigo que escribir.
**Durante el registro,** el dispositivo crea un par de claves criptograficas y almacena la clave privada en su hardware seguro.
**Al iniciar sesion,** la huella o el rostro del voluntario desbloquea la clave privada, que firma un desafio de un solo uso del servidor. El servidor verifica la firma sin ver nunca la clave privada.
**Resistencia al phishing.** La firma solo funciona para este intento de inicio de sesion especifico en este sitio especifico. Un atacante no puede repetirla ni redirigirla a otro servidor.
**Perdida del dispositivo.** Si se pierde el dispositivo, el voluntario puede iniciar sesion con otro metodo registrado y eliminar la passkey antigua desde Configuracion.`)
};

/**
* | output |
* | --- |
* | "A passkey uses the device itself as the second factor. There is no code to type. **During enrollment,** the device creates a cryptographic key pair and store..." |
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