/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Sms_BodyInputs */

const en_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six digit code sent to the enrolled phone number through the organization's own telephony provider. Like email codes, each code is single use and expires quickly.
**Security tradeoff.** Text message codes carry the same interception risk as email codes, with the additional concern that phone numbers can be transferred through social engineering attacks on carriers. Organizations should treat SMS as a convenience fallback rather than a primary second factor for volunteers handling high risk cases.`)
};

const es_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un código de seis dígitos enviado al número de teléfono registrado a través del proveedor de telefonía de la organización. Como los códigos por correo, cada código es de un solo uso y caduca rápidamente.
**Compromiso de seguridad.** Los códigos por mensaje de texto tienen el mismo riesgo de interceptación que los códigos por correo, con la preocupación adicional de que los números de teléfono pueden transferirse mediante ataques de ingeniería social a las operadoras. Las organizaciones deberían tratar los SMS como una alternativa de conveniencia en lugar de un segundo factor principal para voluntarios que manejan casos de alto riesgo.`)
};

/**
* | output |
* | --- |
* | "A six digit code sent to the enrolled phone number through the organization's own telephony provider. Like email codes, each code is single use and expires q..." |
*
* @param {Demo_Narrative_Topic_Twofa_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_sms_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Sms_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Sms_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_sms_body(inputs)
	return es_demo_narrative_topic_twofa_sms_body(inputs)
});