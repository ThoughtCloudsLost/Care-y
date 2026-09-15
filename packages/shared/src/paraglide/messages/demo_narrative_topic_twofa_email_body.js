/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Email_BodyInputs */

const en_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six digit code is sent to the email address on file for the account, and it expires five minutes after it is sent.
**Attempts.** An email code survives three wrong entries, after which it is deleted and a new one has to be requested, and a code that has been accepted is deleted as well.
**Resend.** A replacement email code can be asked for sixty seconds after the last one, up to five in an hour.
**What the server holds.** The email address a code is sent to is stored under the server's operational key rather than the end to end scheme, because the server has to read it to hand the code to the mail server, which makes it a deliberate exception to the rule that stored personal data is unreadable to the server.
**Security tradeoff.** An email code is only as strong as the mailbox it lands in, since anyone who can read that mailbox can read the code, and an organization handling the most exposed cases is better served by a passkey or an authenticator app as the primary factor.`)
};

const es_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envía un código de seis dígitos a la dirección de correo registrada en la cuenta, y caduca cinco minutos después de enviarse.
**Intentos.** Un código por correo resiste tres entradas incorrectas, tras las cuales se elimina y hay que pedir uno nuevo, y un código aceptado también se elimina.
**Reenvío.** Puede pedirse un código de repuesto por correo sesenta segundos después del anterior, hasta cinco en una hora.
**Lo que guarda el servidor.** La dirección de correo a la que se envía un código se almacena bajo la clave operativa del servidor y no bajo el esquema de extremo a extremo, porque el servidor tiene que leerla para entregar el código al servidor de correo, lo que la convierte en una excepción deliberada a la regla de que los datos personales almacenados son ilegibles para el servidor.
**Compromiso de seguridad.** Un código por correo es tan fuerte como el buzón al que llega, ya que cualquiera que pueda leer ese buzón puede leer el código, y a una organización que atiende los casos más expuestos le conviene más una passkey o una aplicación de autenticación como factor principal.`)
};

/**
* | output |
* | --- |
* | "A six digit code is sent to the email address on file for the account, and it expires five minutes after it is sent. **Attempts.** An email code survives thr..." |
*
* @param {Demo_Narrative_Topic_Twofa_Email_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_email_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Email_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Email_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_email_body(inputs)
	return en_demo_narrative_topic_twofa_email_body(inputs)
});