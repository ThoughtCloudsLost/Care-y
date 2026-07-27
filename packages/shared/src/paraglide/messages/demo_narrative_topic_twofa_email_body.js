/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Email_BodyInputs */

const en_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six digit code is sent to the email address on file. Codes expire quickly and each one works exactly once. The resend timer prevents rapid retries.`)
};

const es_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envia un codigo de seis digitos a la direccion de correo registrada. Los codigos caducan rapido y cada uno funciona exactamente una vez. El temporizador de reenvio evita reintentos rapidos.`)
};

/**
* | output |
* | --- |
* | "A six digit code is sent to the email address on file. Codes expire quickly and each one works exactly once. The resend timer prevents rapid retries." |
*
* @param {Demo_Narrative_Topic_Twofa_Email_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_email_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Email_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Email_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_email_body(inputs)
	return es_demo_narrative_topic_twofa_email_body(inputs)
});