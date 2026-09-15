/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Sms_BodyInputs */

const en_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server sends a six digit code by text to the enrolled phone number, delivered through the organization's own telephony provider. The code expires after 5 minutes, and the server deletes it after 3 wrong entries or on acceptance, whichever comes first. A resend is available 90 seconds after the last one, up to 3 per hour (tighter than email's 60 seconds and 5 per hour).
**What the server holds.** The phone number is stored under the server's operational key rather than the end to end scheme, because the server must read it to place the message with the provider.
**Security tradeoff.** Text message codes carry the interception risk of an email code, plus the risk that a number can be moved to another device by social engineering a carrier, and the message passes through the telephony provider in the clear. The product treats this as the weakest enrollable method, suited to a convenience fallback rather than the primary factor for work at high risk.`)
};

const es_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor envía un código de seis dígitos por mensaje de texto al número de teléfono registrado, a través del proveedor de telefonía de la organización. El código caduca a los 5 minutos, y el servidor lo borra tras 3 entradas incorrectas o tras la aceptación, lo que ocurra primero. El reenvío está disponible 90 segundos después del último, hasta 3 por hora (más estricto que los 60 segundos y 5 por hora del correo electrónico).
**Lo que almacena el servidor.** El número de teléfono se almacena bajo la clave operativa del servidor en lugar del esquema de extremo a extremo, porque el servidor debe leerlo para cursar el mensaje a través del proveedor.
**Compromiso de seguridad.** Los códigos por mensaje de texto tienen el riesgo de interceptación de un código por correo, más el riesgo de que un número pueda transferirse a otro dispositivo mediante ingeniería social contra la operadora, y el mensaje pasa por el proveedor de telefonía sin cifrar. El producto trata este método como el más débil de los que se pueden registrar, adecuado como alternativa de conveniencia y no como factor principal para trabajo con riesgo alto.`)
};

/**
* | output |
* | --- |
* | "The server sends a six digit code by text to the enrolled phone number, delivered through the organization's own telephony provider. The code expires after 5..." |
*
* @param {Demo_Narrative_Topic_Twofa_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_sms_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Sms_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Sms_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_sms_body(inputs)
	return en_demo_narrative_topic_twofa_sms_body(inputs)
});