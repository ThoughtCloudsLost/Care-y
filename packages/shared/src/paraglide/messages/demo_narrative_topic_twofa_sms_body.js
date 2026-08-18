/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Sms_BodyInputs */

const en_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six digit code sent to the enrolled phone number through the organization's own telephony provider. Like email codes, each code is single use and expires quickly.
**Security tradeoff.** Text message codes carry the same interception risk as email codes, with the additional concern that phone numbers can be transferred through social engineering attacks on carriers. Organizations should treat SMS as a convenience fallback rather than a primary second factor for volunteers handling high risk cases.`)
};

const es_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un codigo de seis digitos enviado al numero de telefono registrado a traves del proveedor de telefonia de la organizacion. Como los codigos por correo, cada codigo es de un solo uso y caduca rapidamente.
**Compromiso de seguridad.** Los codigos por mensaje de texto tienen el mismo riesgo de interceptacion que los codigos por correo, con la preocupacion adicional de que los numeros de telefono pueden transferirse mediante ataques de ingenieria social a las operadoras. Las organizaciones deberian tratar los SMS como una alternativa de conveniencia en lugar de un segundo factor principal para voluntarios que manejan casos de alto riesgo.`)
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