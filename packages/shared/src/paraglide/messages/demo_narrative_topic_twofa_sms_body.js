/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Sms_BodyInputs */

const en_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six digit code is sent by text message to the phone number enrolled on the account, delivered through the organization's own telephony provider, and it expires five minutes after it is sent.
**Attempts.** A text message code survives three wrong entries, after which it is deleted and a new one has to be requested, and a code that has been accepted is deleted as well.
**Resend.** A replacement text message code can be asked for ninety seconds after the last one, up to three in an hour.
**What the server holds.** The phone number enrolled for text message codes is stored under the server's operational key rather than the end to end scheme, because the server has to read it to place the message with the telephony provider.
**Security tradeoff.** A text message code carries the interception risk of an email code plus the risk that a phone number can be moved to another device by social engineering a carrier, and the message passes through the telephony provider in the clear, which is why the product treats this as the weakest of the methods that can be enrolled and why it suits a convenience fallback better than the primary factor for high risk work.`)
};

const es_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envía un código de seis dígitos por mensaje de texto al número de teléfono registrado en la cuenta, entregado a través del proveedor de telefonía de la propia organización, y caduca cinco minutos después de enviarse.
**Intentos.** Un código por mensaje de texto resiste tres entradas incorrectas, tras las cuales se elimina y hay que pedir uno nuevo, y un código aceptado también se elimina.
**Reenvío.** Puede pedirse un código de repuesto por mensaje de texto noventa segundos después del anterior, hasta tres en una hora.
**Lo que guarda el servidor.** El número de teléfono registrado para los códigos por mensaje de texto se almacena bajo la clave operativa del servidor y no bajo el esquema de extremo a extremo, porque el servidor tiene que leerlo para cursar el mensaje con el proveedor de telefonía.
**Compromiso de seguridad.** Un código por mensaje de texto arrastra el riesgo de interceptación del código por correo más el riesgo de que un número de teléfono se traslade a otro dispositivo mediante ingeniería social con la operadora, y el mensaje pasa en claro por el proveedor de telefonía, razón por la cual el producto lo trata como el más débil de los métodos que pueden registrarse y encaja mejor como alternativa cómoda que como factor principal en trabajo de alto riesgo.`)
};

/**
* | output |
* | --- |
* | "A six digit code is sent by text message to the phone number enrolled on the account, delivered through the organization's own telephony provider, and it exp..." |
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