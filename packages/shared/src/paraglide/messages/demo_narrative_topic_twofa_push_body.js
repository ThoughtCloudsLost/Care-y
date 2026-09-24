/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Push_BodyInputs */

const en_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When push notifications are enabled, a sign-in attempt sends an approval prompt to the device. Approving completes the sign-in. No code is involved.
Each prompt is tied to a single session and expires after two minutes. A denied or ignored prompt is discarded, and any other enrolled method remains available.`)
};

const es_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando las notificaciones push están activadas, un intento de inicio de sesión envía una solicitud de aprobación al dispositivo. Al aprobar, el inicio de sesión se completa. No se requiere ningún código.
Cada solicitud está vinculada a una sola sesión y caduca a los dos minutos. Una solicitud rechazada o ignorada se descarta, y cualquier otro método inscrito permanece disponible.`)
};

const en_xa2_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn pùsh nòtìfìcàtìòns àrè ènàblèd, à sìgn-ìn àttèmpt sènds àn àppròvàl pròmpt tò thè dèvìcè. Àppròvìng còmplètès thè sìgn-ìn. Nò còdè ìs ìnvòlvèd.
Èàch pròmpt ìs tìèd tò à sìnglè sèssìòn ànd èxpìrès àftèr twò mìnùtès. À dènìèd òr ìgnòrèd pròmpt ìs dìscàrdèd, ànd àny òthèr ènròllèd mèthòd rèmàìns àvàìlàblè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When push notifications are enabled, a sign-in attempt sends an approval prompt to the device. Approving completes the sign-in. No code is involved. Each pro..." |
*
* @param {Demo_Narrative_Topic_Twofa_Push_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_push_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Push_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Push_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_push_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_push_body(inputs)
	return en_demo_narrative_topic_twofa_push_body(inputs)
});