/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Totp_BodyInputs */

const en_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An authenticator app on the user's own device generates a six digit code that changes every thirty seconds, computed from a secret shared with CARE-Y when the method is enrolled.
**Enrollment.** Enrolling an authenticator app shows a QR code carrying the shared secret, and any app following the authenticator standard can read it.
**How it works.** An authenticator app computes each code from the secret it shares with CARE-Y and the current time, with no network connection of its own, so the method keeps working where connectivity does not.
**Time drift.** CARE-Y accepts an authenticator code for the current thirty second step and one step on either side, which absorbs small clock differences between the device and the server and gives any single code a ninety second life, and a code that has been accepted is refused for the rest of that span so an intercepted code cannot be replayed.`)
};

const es_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una aplicación de autenticación en el dispositivo de la persona usuaria genera un código de seis dígitos que cambia cada treinta segundos, calculado a partir de un secreto compartido con CARE-Y al registrar el método.
**Registro.** Registrar una aplicación de autenticación muestra un código QR que lleva el secreto compartido, y cualquier aplicación que siga el estándar de autenticación puede leerlo.
**Cómo funciona.** Una aplicación de autenticación calcula cada código a partir del secreto que comparte con CARE-Y y de la hora actual, sin conexión de red propia, así que el método sigue funcionando donde la conectividad no lo hace.
**Desfase horario.** CARE-Y acepta un código de autenticación en el intervalo de treinta segundos en curso y uno a cada lado, lo que absorbe pequeñas diferencias de reloj entre el dispositivo y el servidor y da a cada código una vida de noventa segundos, y un código ya aceptado se rechaza durante el resto de ese lapso para que un código interceptado no pueda reutilizarse.`)
};

/**
* | output |
* | --- |
* | "An authenticator app on the user's own device generates a six digit code that changes every thirty seconds, computed from a secret shared with CARE-Y when th..." |
*
* @param {Demo_Narrative_Topic_Twofa_Totp_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_totp_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Totp_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Totp_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_totp_body(inputs)
	return en_demo_narrative_topic_twofa_totp_body(inputs)
});