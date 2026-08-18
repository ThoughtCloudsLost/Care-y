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
	return /** @type {LocalizedString} */ (`Una notificacion enviada a otro dispositivo donde el voluntario ya tiene sesion iniciada. Aprobar la notificacion en ese dispositivo completa el inicio de sesion en este sin escribir ningun codigo.
**Como funciona.** La pantalla de inicio de sesion espera hasta que el desafio se aprueba, se niega o caduca. La aprobacion push es util cuando un voluntario tiene la aplicacion abierta en un segundo dispositivo, como una tableta en el escritorio y un telefono en la mano.
**Alternativa.** Si el voluntario niega la notificacion push o caduca, puede cambiar a otro metodo registrado desde la pantalla de inicio de sesion.`)
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