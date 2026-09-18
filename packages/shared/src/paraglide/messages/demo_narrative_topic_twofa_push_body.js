/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Push_BodyInputs */

const en_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If you have push notifications enabled, a sign-in attempt sends an approval prompt to your device. Tap to approve and the sign-in completes. No code is involved.
Each prompt is tied to a single session and expires after two minutes. If you deny or ignore it, the prompt is discarded and you can use any other enrolled method instead.`)
};

const es_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si las notificaciones push están activadas, un intento de inicio de sesión envía una solicitud de aprobación al dispositivo. Toque para aprobar y el inicio de sesión se completa. No se requiere ningún código.
Cada solicitud está vinculada a una sola sesión y caduca a los dos minutos. Si se rechaza o se ignora, la solicitud se descarta y se puede usar cualquier otro método inscrito en su lugar.`)
};

/**
* | output |
* | --- |
* | "If you have push notifications enabled, a sign-in attempt sends an approval prompt to your device. Tap to approve and the sign-in completes. No code is invol..." |
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