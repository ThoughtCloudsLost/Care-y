/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Push_BodyInputs */

const en_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A notification sent to another device where the volunteer is already signed in. Approving the notification on that device completes the sign in on this one without typing a code.
**How it works.** The login screen waits until the challenge is approved, denied, or times out. Push approval is useful when a volunteer has the app open on a second device, such as a tablet at a desk and a phone in hand.
**Fallback.** If the volunteer denies the push or it times out, they can switch to another enrolled method from the login screen.`)
};

const es_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una notificación enviada a otro dispositivo donde el voluntario ya tiene sesión iniciada. Aprobar la notificación en ese dispositivo completa el inicio de sesión en este sin escribir ningún código.
**Cómo funciona.** La pantalla de inicio de sesión espera hasta que el desafío se aprueba, se niega o caduca. La aprobación push es útil cuando un voluntario tiene la aplicación abierta en un segundo dispositivo, como una tableta en el escritorio y un teléfono en la mano.
**Alternativa.** Si el voluntario niega la notificación push o caduca, puede cambiar a otro método registrado desde la pantalla de inicio de sesión.`)
};

/**
* | output |
* | --- |
* | "A notification sent to another device where the volunteer is already signed in. Approving the notification on that device completes the sign in on this one w..." |
*
* @param {Demo_Narrative_Topic_Twofa_Push_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_push_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Push_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Push_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_push_body(inputs)
	return es_demo_narrative_topic_twofa_push_body(inputs)
});