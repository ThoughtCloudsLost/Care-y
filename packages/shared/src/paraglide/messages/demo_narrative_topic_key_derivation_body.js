/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Key_Derivation_BodyInputs */

const en_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your password is the starting point, but it is not the key. The browser runs an Argon2id derivation (tuned to use 64 MB of memory across four passes) to transform your password into raw key material. This derivation happens entirely in your browser, and the server never sees its input or output.
**How it works.** The derived material then passes through a threshold protocol involving two servers located in separate legal jurisdictions. Your browser blinds its input before sending it, and unblinds the result after both servers respond. Neither server sees your password, your derived key, or what the other server contributed. Each server holds one share, and a single share is mathematically useless on its own.
**Encryption.** The combined output produces your personal keypair and the key that unwraps your organization's shared encryption key. Only after this process completes can your browser decrypt case data.
**Privacy.** This design means that compromising one server, or compelling disclosure in one jurisdiction, yields nothing. An attacker would need both servers, access in both legal jurisdictions, your password, and your second factor. Shares are refreshed on a schedule, so a captured share expires even if never detected.`)
};

const es_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La contraseña es el punto de partida, pero no es la clave. El navegador ejecuta una derivación Argon2id (configurada para usar 64 MB de memoria en cuatro pasadas) para transformar la contraseña en material criptográfico. Esta derivación ocurre enteramente en el navegador, y el servidor nunca ve su entrada ni su salida.
**Cómo funciona.** El material derivado pasa luego por un protocolo de umbral que involucra dos servidores ubicados en jurisdicciones legales separadas. El navegador ciega su entrada antes de enviarla y desciega el resultado tras la respuesta de ambos servidores. Ningún servidor ve la contraseña, la clave derivada ni lo que contribuyó el otro servidor. Cada servidor posee una parte, y una sola parte es matemáticamente inútil por sí misma.
**Cifrado.** La salida combinada produce el par de claves personal y la clave que desenvuelve la clave de cifrado compartida de la organización. Solo tras completar este proceso puede el navegador descifrar los datos de los casos.
**Privacidad.** Este diseño significa que comprometer un servidor, u obligar a revelar información en una jurisdicción, no produce nada. Un atacante necesitaría ambos servidores, acceso en ambas jurisdicciones legales, la contraseña y el segundo factor. Las partes se renuevan periódicamente, de modo que una parte capturada caduca aunque nunca se detecte.`)
};

/**
* | output |
* | --- |
* | "Your password is the starting point, but it is not the key. The browser runs an Argon2id derivation (tuned to use 64 MB of memory across four passes) to tran..." |
*
* @param {Demo_Narrative_Topic_Key_Derivation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_key_derivation_body = /** @type {((inputs?: Demo_Narrative_Topic_Key_Derivation_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Key_Derivation_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_key_derivation_body(inputs)
	return en_demo_narrative_topic_key_derivation_body(inputs)
});