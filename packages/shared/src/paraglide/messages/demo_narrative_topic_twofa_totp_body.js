/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Totp_BodyInputs */

const en_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An authenticator app on your device generates a six digit code that changes every thirty seconds. The code is computed from a secret shared once at enrollment, so generating it needs no network at all. CARE-Y verifies the code and rejects reuse of a code it has already seen.`)
};

const es_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una aplicacion de autenticacion en tu dispositivo genera un codigo de seis digitos que cambia cada treinta segundos. El codigo se calcula a partir de un secreto compartido una sola vez durante el registro, por lo que generarlo no necesita red. CARE-Y verifica el codigo y rechaza la reutilizacion de un codigo que ya ha visto.`)
};

/**
* | output |
* | --- |
* | "An authenticator app on your device generates a six digit code that changes every thirty seconds. The code is computed from a secret shared once at enrollmen..." |
*
* @param {Demo_Narrative_Topic_Twofa_Totp_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_totp_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Totp_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Totp_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_totp_body(inputs)
	return es_demo_narrative_topic_twofa_totp_body(inputs)
});