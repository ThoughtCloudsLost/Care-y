/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Totp_BodyInputs */

const en_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An authenticator app shows a six-digit code that changes every thirty seconds, computed from a secret shared once at enrollment and the current time, so it works with the phone offline. Any standard authenticator app can hold it. [[#privacy #keys]]
**Why the codes use SHA-1.** The code is an HMAC over a time counter, and the hash is SHA-1 because widely used authenticator apps do not reliably accept SHA-256 or SHA-512. SHA-1's collision weakness does not apply to this use, where the hash acts as a keyed pseudorandom function rather than as a fingerprint of a document. [[#encryption]]
**The acceptance span and the replay rule.** One time step either side of the server's clock is accepted, which makes a code usable for ninety seconds around the moment it was shown. An accepted code is remembered for exactly that span and a repeat inside it is refused, so watching someone type a code does not buy the watcher a second use of it. The record of accepted codes lives in the running process, which means a restart reopens that ninety-second window for codes accepted just before it, a cost accepted against a database write on every sign-in. [[#failure-states #encryption]]
**Where the secret lives.** The shared secret is stored encrypted under the server's operational key, not under the organization's end-to-end key, because the server has to compute the expected code to compare against. The enrollment secret is put on screen for scanning and never leaves the browser in any other form, since the code for the QR is drawn in the browser from a string the server sends. [[#server-holds #trust-boundary]]
**The replay cache and the code path.** The implementation is \`packages/server/src/auth/totp.ts\` with the accepted-code record in \`packages/server/src/auth/totp-replay-cache.ts\`, which refuses to boot across more than one application instance because a process-local record would not be shared. The secret row is \`packages/server/src/db/migrations/tenant/007_create_totp_secrets.ts\`. [[#server-holds #failure-states]]`)
};

const es_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una aplicación de autenticación muestra un código de seis dígitos que cambia cada treinta segundos, calculado a partir de un secreto compartido una sola vez en la inscripción y de la hora actual, de modo que funciona con el teléfono sin conexión. Puede guardarlo cualquier aplicación de autenticación estándar. [[#privacy #keys]]
**Por qué los códigos usan SHA-1.** El código es un HMAC sobre un contador temporal, y el hash es SHA-1 porque las aplicaciones de autenticación más extendidas no aceptan de forma fiable SHA-256 ni SHA-512. La debilidad de SHA-1 frente a colisiones no se aplica a este uso, en el que el hash actúa como función pseudoaleatoria con clave y no como huella de un documento. [[#encryption]]
**El margen de aceptación y la regla de reutilización.** Se acepta un paso de tiempo a cada lado del reloj del servidor, lo que hace que un código sirva durante noventa segundos alrededor del momento en que se mostró. Un código aceptado se recuerda exactamente durante ese margen y una repetición dentro de él se rechaza, así que ver a alguien teclear un código no le da a quien mira un segundo uso. El registro de códigos aceptados vive en el proceso en ejecución, de modo que un reinicio vuelve a abrir esa ventana de noventa segundos para los códigos aceptados justo antes, un coste asumido frente a una escritura en la base de datos en cada inicio de sesión. [[#failure-states #encryption]]
**Dónde vive el secreto.** El secreto compartido se guarda cifrado con la clave operativa del servidor y no con la clave de extremo a extremo de la organización, porque el servidor tiene que calcular el código esperado para compararlo. El secreto de inscripción se muestra en pantalla para escanearlo y no sale del navegador de ninguna otra forma, ya que el código QR se dibuja en el navegador a partir de una cadena que envía el servidor. [[#server-holds #trust-boundary]]
**La caché de reutilización y la ruta del código.** La implementación es \`packages/server/src/auth/totp.ts\`, con el registro de códigos aceptados en \`packages/server/src/auth/totp-replay-cache.ts\`, que se niega a arrancar con más de una instancia de la aplicación porque un registro local al proceso no se compartiría. La fila del secreto es \`packages/server/src/db/migrations/tenant/007_create_totp_secrets.ts\`. [[#server-holds #failure-states]]`)
};

const en_xa2_demo_narrative_topic_twofa_totp_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Totp_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn àùthèntìcàtòr àpp gènèràtès à sìx-dìgìt còdè thàt chàngès èvèry 30 sècònds. Thè còdè ìs còmpùtèd fròm à shàrèd sècrèt ànd thè cùrrènt tìmè, sò ìt wòrks wìthòùt à nètwòrk cònnèctìòn. Àny stàndàrd àùthèntìcàtòr àpp ìs sùppòrtèd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Thè sèrvèr àccèpts à 90-sècònd wìndòw tò àccòùnt fòr slìght clòck drìft. Èàch còdè càn ònly bè ùsèd òncè wìthìn ìts wìndòw, whìch prèvènts rèplày ìf sòmèònè òbsèrvès ìt. •••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An authenticator app shows a six-digit code that changes every thirty seconds, computed from a secret shared once at enrollment and the current time, so it w..." |
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