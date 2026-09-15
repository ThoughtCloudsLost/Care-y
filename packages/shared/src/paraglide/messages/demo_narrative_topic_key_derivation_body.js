/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Key_Derivation_BodyInputs */

const en_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y never stores the keys that decrypt its data. They are computed from the password at each sign in, they live only in the browser's memory and are erased when the last tab closes, and what the server holds for each user is a salt and a public key rather than the keys themselves.
**How it works.** The browser stretches the password with Argon2id and then runs a threshold oblivious pseudorandom function, or OPRF, a protocol that lets two independent servers hosted in separate countries help compute a key without learning anything about it. The browser blinds its input before sending it and unblinds the answer when it returns, so neither server sees the password or the result, and each server holds only a share of the key material, so both have to answer for the derivation to succeed. From the output the browser derives the user's own key pair and the key that unwraps the organization key.
**Why two servers.** Compromising one of the two derivation servers reconstructs nothing, because a single share cannot produce the answer on its own, and an attacker would need both servers at once, in two different legal jurisdictions, along with the user's password and second factor.
**Legal reach.** A legal order served in one of the two host countries reaches a share that is useless by itself, so no single jurisdiction can compel decryption.
**Key share refresh.** The two derivation servers refresh their key shares regularly, which leaves a share captured in one period useless against the ones in use in the next.`)
};

const es_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y nunca almacena las claves que descifran sus datos. Se calculan a partir de la contraseña en cada inicio de sesión, viven solo en la memoria del navegador y se borran al cerrarse la última pestaña, y lo que el servidor guarda de cada persona usuaria es una sal y una clave pública, no las claves en sí.
**Cómo funciona.** El navegador estira la contraseña con Argon2id y después ejecuta una función pseudoaleatoria ciega con umbral, u OPRF, un protocolo que permite que dos servidores independientes alojados en países distintos ayuden a calcular una clave sin aprender nada sobre ella. El navegador ciega su entrada antes de enviarla y revierte ese cegado sobre la respuesta cuando vuelve, de modo que ninguno de los dos servidores ve la contraseña ni el resultado, y cada servidor posee solo una parte del material criptográfico, así que ambos deben responder para que la derivación tenga éxito. A partir del resultado el navegador deriva el par de claves propio de la persona usuaria y la clave que desenvuelve la clave de la organización.
**Por qué dos servidores.** Comprometer uno de los dos servidores de derivación no reconstruye nada, porque una sola parte no puede producir la respuesta por sí misma, y un atacante necesitaría los dos servidores a la vez, en dos jurisdicciones legales distintas, además de la contraseña y el segundo factor de la persona usuaria.
**Alcance legal.** Una orden judicial presentada en uno de los dos países anfitriones alcanza una parte inútil por sí misma, así que ninguna jurisdicción por separado puede forzar el descifrado.
**Renovación de las partes de las claves.** Los dos servidores de derivación renuevan sus partes de las claves con regularidad, lo que deja inservible una parte capturada en un período frente a las que están en uso en el siguiente.`)
};

/**
* | output |
* | --- |
* | "CARE-Y never stores the keys that decrypt its data. They are computed from the password at each sign in, they live only in the browser's memory and are erase..." |
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