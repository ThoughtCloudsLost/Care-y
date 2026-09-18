/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Sms_BodyInputs */

const en_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six-digit code is sent by text message to the enrolled phone number. It expires after five minutes and is deleted after three incorrect attempts.
**What the server holds.** Like email, the phone number is stored under operational encryption so the server can reach it.
**Security tradeoff.** SMS carries additional exposure: carriers can be targeted through social engineering, and the telephony provider handles the message in cleartext. Of the available methods, SMS provides the least protection. It is offered as a convenience fallback when stronger options are not practical.`)
};

const es_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envía un código de seis dígitos por mensaje de texto al número de teléfono inscrito. Caduca a los cinco minutos y se elimina tras tres intentos incorrectos.
**Lo que almacena el servidor.** Al igual que con el correo electrónico, el número de teléfono se almacena bajo cifrado operativo para que el servidor pueda contactarlo.
**Compromiso de seguridad.** El SMS conlleva una exposición adicional: las operadoras pueden ser objetivo de ingeniería social y el proveedor de telefonía maneja el mensaje en texto plano. De los métodos disponibles, el SMS ofrece la menor protección. Se ofrece como alternativa de conveniencia cuando las opciones más seguras no son viables.`)
};

/**
* | output |
* | --- |
* | "A six-digit code is sent by text message to the enrolled phone number. It expires after five minutes and is deleted after three incorrect attempts. **What th..." |
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