/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Totp_BodyInputs */

const en_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An authenticator app generates a six-digit code that changes every 30 seconds. The code is computed from a shared secret and the current time, so it works without a network connection. Any standard authenticator app is supported.
**How it works.** The server accepts a 90-second window to account for slight clock drift. Each code can only be used once within its window, which prevents replay if someone observes it.`)
};

const es_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una aplicación de autenticación genera un código de seis dígitos que cambia cada 30 segundos. El código se calcula a partir de un secreto compartido y la hora actual, por lo que funciona sin conexión de red. Se admite cualquier aplicación de autenticación estándar.
**Cómo funciona.** El servidor acepta una ventana de 90 segundos para compensar pequeñas diferencias de reloj. Cada código solo puede usarse una vez dentro de su ventana, lo que impide la reutilización si alguien lo observa.`)
};

const en_xa2_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn àùthèntìcàtòr àpp gènèràtès à sìx-dìgìt còdè thàt chàngès èvèry 30 sècònds. Thè còdè ìs còmpùtèd fròm à shàrèd sècrèt ànd thè cùrrènt tìmè, sò ìt wòrks wìthòùt à nètwòrk cònnèctìòn. Àny stàndàrd àùthèntìcàtòr àpp ìs sùppòrtèd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Thè sèrvèr àccèpts à 90-sècònd wìndòw tò àccòùnt fòr slìght clòck drìft. Èàch còdè càn ònly bè ùsèd òncè wìthìn ìts wìndòw, whìch prèvènts rèplày ìf sòmèònè òbsèrvès ìt. •••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An authenticator app generates a six-digit code that changes every 30 seconds. The code is computed from a shared secret and the current time, so it works wi..." |
*
* @param {Demo_Narrative_Topic_Twofa_Totp_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_totp_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Totp_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Totp_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_totp_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_totp_body(inputs)
	return en_demo_narrative_topic_twofa_totp_body(inputs)
});