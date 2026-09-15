/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Passkey_BodyInputs */

const en_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A passkey makes a device the second factor, so there is no code to type. Two forms are accepted: one held by the device in use and unlocked with its own screen lock, and one held by a separate physical security key that plugs in or taps against the phone.
**How it works.** The server stores only the public half of the credential and has no way to produce a signature of its own, so a compromised server cannot impersonate a passkey. Enrollment creates a key pair on the device or security key, and the device keeps the private half and hands over only the public half. Signing in unlocks the passkey, which signs a one time challenge issued by the server, and the server checks the signature against the stored public key. The challenge is discarded once answered, so the same signature cannot be presented twice. A passkey signature is bound to the challenge and to the site that issued it, so a signature collected by a lookalike site is worthless against CARE-Y.
**If it fails.** If the device is lost, the user can sign in with another enrolled method and delete the lost credential. If the passkey was the only method enrolled, another must be enrolled before it can be deleted.`)
};

const es_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una passkey convierte un dispositivo en el segundo factor, por lo que no hay código que escribir. Se aceptan dos formas: una almacenada en el dispositivo en uso y desbloqueada con su propio bloqueo de pantalla, y otra almacenada en una llave de seguridad física separada que se conecta o se acerca al teléfono.
**Cómo funciona.** El servidor almacena solo la mitad pública de la credencial y no tiene forma de producir una firma por su cuenta, de modo que un servidor comprometido no puede suplantar una passkey. El registro crea un par de claves en el dispositivo o la llave de seguridad, y el dispositivo conserva la mitad privada y entrega solo la mitad pública. Al iniciar sesión se desbloquea la passkey, que firma un desafío de un solo uso emitido por el servidor, y el servidor comprueba la firma contra la clave pública almacenada. El desafío se descarta una vez respondido, de modo que la misma firma no puede presentarse dos veces. La firma de una passkey está vinculada al desafío y al sitio que lo emitió, por lo que una firma recogida por un sitio que imite a CARE-Y no tiene valor contra CARE-Y.
**Si falla.** Si se pierde el dispositivo, la persona usuaria puede iniciar sesión con otro método registrado y eliminar la credencial perdida. Si la passkey era el único método registrado, se debe registrar otro antes de poder eliminarla.`)
};

/**
* | output |
* | --- |
* | "A passkey makes a device the second factor, so there is no code to type. Two forms are accepted: one held by the device in use and unlocked with its own scre..." |
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