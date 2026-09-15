/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Push_BodyInputs */

const en_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Push approval sends a notification to the devices where the user has turned push notifications on, and approving there completes the sign in on the device that asked with no code typed anywhere. A push challenge ends on approval, on denial, or on expiry 2 minutes after being sent, and the sign in screen waits for whichever comes first. The challenge is tied to the session that created it, so an approval releases that one sign in attempt and nothing else.
**Fallback.** A denied or expired challenge leaves every other enrolled method available, and the sign in can continue with any of them.`)
};

const es_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La aprobación push envía una notificación a los dispositivos donde se han activado las notificaciones push, y aprobar allí completa el inicio de sesión en el dispositivo que lo solicitó sin necesidad de escribir ningún código. Un desafío push termina por aprobación, por rechazo, o por expiración 2 minutos después de enviarse, y la pantalla de inicio de sesión espera lo que ocurra primero. El desafío está vinculado a la sesión que lo creó, de modo que una aprobación libera únicamente ese intento de inicio de sesión.
**Alternativa.** Un desafío rechazado o expirado deja disponibles todos los demás métodos registrados, y el inicio de sesión puede continuar con cualquiera de ellos.`)
};

/**
* | output |
* | --- |
* | "Push approval sends a notification to the devices where the user has turned push notifications on, and approving there completes the sign in on the device th..." |
*
* @param {Demo_Narrative_Topic_Twofa_Push_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_push_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Push_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Push_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_push_body(inputs)
	return en_demo_narrative_topic_twofa_push_body(inputs)
});