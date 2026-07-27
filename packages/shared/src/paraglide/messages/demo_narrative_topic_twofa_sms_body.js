/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Sms_BodyInputs */

const en_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six digit code is sent to the enrolled phone number through the organization's own telephony provider. Like email codes, each code is short lived and single use.`)
};

const es_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envia un codigo de seis digitos al numero de telefono registrado a traves del proveedor de telefonia de la organizacion. Como los codigos por correo, cada codigo es de corta duracion y de un solo uso.`)
};

/**
* | output |
* | --- |
* | "A six digit code is sent to the enrolled phone number through the organization's own telephony provider. Like email codes, each code is short lived and singl..." |
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