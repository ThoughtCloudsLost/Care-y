/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Email_BodyInputs */

const en_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server sends a six digit code to the email address on file. The code expires after 5 minutes, and the server deletes it after 3 wrong entries or on acceptance, whichever comes first. A resend is available 60 seconds after the last one, up to 5 per hour.
**What the server holds.** The email address is stored under the server's operational key rather than the end to end scheme, because the server must read it to hand the code to the mail server. That is a deliberate exception to the rule that stored personal data is unreadable to the server.
**Security tradeoff.** The code is only as strong as the mailbox it lands in, since anyone who can read that mailbox can read the code. An organization handling the most exposed cases is better served by a passkey or authenticator app as the primary factor.`)
};

const es_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor envía un código de seis dígitos a la dirección de correo electrónico registrada. El código caduca a los 5 minutos, y el servidor lo borra tras 3 entradas incorrectas o tras la aceptación, lo que ocurra primero. El reenvío está disponible 60 segundos después del último, hasta 5 por hora.
**Lo que almacena el servidor.** La dirección de correo se almacena bajo la clave operativa del servidor en lugar del esquema de extremo a extremo, porque el servidor debe leerla para entregarle el código al servidor de correo. Esa es una excepción deliberada a la regla de que los datos personales almacenados son ilegibles para el servidor.
**Compromiso de seguridad.** El código es tan seguro como el buzón en el que cae, ya que cualquier persona que pueda leer ese buzón puede leer el código. Una organización que maneje los casos más expuestos está mejor servida con una passkey o una aplicación de autenticación como factor principal.`)
};

/**
* | output |
* | --- |
* | "The server sends a six digit code to the email address on file. The code expires after 5 minutes, and the server deletes it after 3 wrong entries or on accep..." |
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