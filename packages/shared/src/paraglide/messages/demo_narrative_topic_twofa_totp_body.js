/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Totp_BodyInputs */

const en_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An authenticator app on the user's own device generates a six digit code that changes every 30 seconds, computed from a secret shared with CARE-Y at enrollment. Enrollment shows a QR code carrying that secret, and any app following the authenticator standard can read it.
**How it works.** The app computes each code from the secret plus the current time, with no network connection of its own, so it works where connectivity does not. CARE-Y accepts the current 30 second step and one step either side, which absorbs small clock differences and gives any code a 90 second life. An accepted code is refused for the rest of that span, so an intercepted code cannot be replayed.`)
};

const es_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una aplicación de autenticación en el propio dispositivo de la persona usuaria genera un código de seis dígitos que cambia cada 30 segundos, calculado a partir de un secreto compartido con CARE-Y durante el registro. El registro muestra un código QR con ese secreto, y cualquier aplicación que siga el estándar de autenticación puede leerlo.
**Cómo funciona.** La aplicación calcula cada código a partir del secreto más la hora actual, sin conexión de red propia, por lo que funciona donde no hay conectividad. CARE-Y acepta el paso de 30 segundos actual y un paso a cada lado, lo que absorbe pequeñas diferencias de reloj y da a cada código una vida de 90 segundos. Un código aceptado se rechaza durante el resto de ese intervalo, de modo que un código interceptado no puede reutilizarse.`)
};

/**
* | output |
* | --- |
* | "An authenticator app on the user's own device generates a six digit code that changes every 30 seconds, computed from a secret shared with CARE-Y at enrollme..." |
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