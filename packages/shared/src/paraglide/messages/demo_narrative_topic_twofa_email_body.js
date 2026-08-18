/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Email_BodyInputs */

const en_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six digit code sent to the email address on file for the volunteer's account. Codes expire after a short window and each one works exactly once.
**Resend.** If the code does not arrive, a resend button appears after a brief timer to prevent flooding the inbox.
**Security tradeoff.** Anyone with access to the volunteer's email could intercept the code. Organizations handling especially sensitive cases may want to encourage stronger methods like passkeys or authenticator apps as the primary factor.`)
};

const es_demo_narrative_topic_twofa_email_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Email_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un codigo de seis digitos enviado a la direccion de correo registrada en la cuenta del voluntario. Los codigos caducan tras una ventana corta y cada uno funciona exactamente una vez.
**Reenvio.** Si el codigo no llega, aparece un boton de reenvio tras un breve temporizador para evitar inundar la bandeja de entrada.
**Compromiso de seguridad.** Cualquier persona con acceso al correo del voluntario podria interceptar el codigo. Las organizaciones que manejan casos especialmente sensibles pueden querer fomentar metodos mas seguros como passkeys o aplicaciones de autenticacion como factor principal.`)
};

/**
* | output |
* | --- |
* | "A six digit code sent to the email address on file for the volunteer's account. Codes expire after a short window and each one works exactly once. **Resend.*..." |
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