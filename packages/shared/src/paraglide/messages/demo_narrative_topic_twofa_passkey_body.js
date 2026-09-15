/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Passkey_BodyInputs */

const en_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A passkey makes a device the second factor, so there is no code to type. CARE-Y accepts two forms of it, one held by the device being used and unlocked with that device's own screen lock, and one held by a separate physical security key that plugs in or taps against the phone.
**Enrollment.** Enrolling a passkey creates a key pair on the device or on the security key, which keeps the private half and hands over only the public half, and that public half is the whole of what the server stores for the credential.
**Signing in.** Unlocking the passkey signs a one time challenge issued by the server, which checks the signature against the stored public key. The challenge is discarded once it has been answered, so the same signature cannot be presented twice, and the server has no way to produce a signature of its own.
**Phishing resistance.** A passkey signature is bound to the challenge it answers and to the site that issued that challenge, so a signature collected by a lookalike site is worthless against CARE-Y.
**Device loss.** A user who loses an enrolled device signs in with another enrolled method and deletes the lost credential, and when the passkey was the only method enrolled, another one has to be enrolled before it can be deleted.`)
};

const es_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una passkey convierte un dispositivo en el segundo factor, así que no hay ningún código que escribir. CARE-Y admite dos formas, una guardada en el dispositivo que se está usando y desbloqueada con el bloqueo de pantalla de ese mismo dispositivo, y otra guardada en una llave de seguridad física aparte que se conecta o se acerca al teléfono.
**Registro.** Registrar una passkey crea un par de claves en el dispositivo o en la llave de seguridad, que conserva la mitad privada y entrega solo la mitad pública, y esa mitad pública es todo lo que el servidor almacena de esa credencial.
**Al iniciar sesión.** Desbloquear la passkey firma un desafío de un solo uso emitido por el servidor, que comprueba la firma contra la clave pública almacenada. El desafío se descarta en cuanto se responde, de modo que la misma firma no puede presentarse dos veces, y el servidor no tiene forma de producir una firma por su cuenta.
**Resistencia al phishing.** La firma de una passkey queda ligada al desafío que responde y al sitio que emitió ese desafío, así que una firma recogida por un sitio que imita a CARE-Y no sirve de nada contra él.
**Pérdida del dispositivo.** La persona usuaria que pierde un dispositivo registrado inicia sesión con otro método registrado y elimina la credencial perdida, y cuando la passkey era el único método registrado hay que registrar otro antes de poder eliminarla.`)
};

/**
* | output |
* | --- |
* | "A passkey makes a device the second factor, so there is no code to type. CARE-Y accepts two forms of it, one held by the device being used and unlocked with ..." |
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