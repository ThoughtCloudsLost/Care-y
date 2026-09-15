/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Key_Derivation_BodyInputs */

const en_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y never stores the keys that decrypt its data. They are computed from the password at each sign in, live only in browser memory, and are erased when the last tab closes.
**What the server holds.** The server holds a salt and a public key per user.
**How it works.** Neither server can see the password or the derived key, because the browser blinds its input before sending and unblinds the answer on return. The browser stretches the password with Argon2id, then runs a threshold OPRF (oblivious pseudorandom function) with two independent servers hosted in separate countries. Each server holds only a share, and both must answer for derivation to succeed. From the output the browser derives the user's key pair and the key that unwraps the organization key.
**Why it matters.** Compromising one server reconstructs nothing, because a single share cannot produce the answer alone. An attacker needs both servers at once, in two legal jurisdictions, plus the password and the second factor. A legal order in one host country reaches a share that is useless alone, so no single jurisdiction can compel decryption. The two servers refresh their shares regularly, so a share captured in one period is useless against the next.`)
};

const es_demo_narrative_topic_key_derivation_body = /** @type {(inputs: Demo_Narrative_Topic_Key_Derivation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y nunca almacena las claves que descifran sus datos. Se calculan a partir de la contraseña en cada inicio de sesión, viven solo en la memoria del navegador y se borran cuando se cierra la última pestaña.
**Lo que almacena el servidor.** El servidor guarda una sal y una clave pública por cuenta.
**Cómo funciona.** Ningún servidor puede ver la contraseña ni la clave derivada, porque el navegador ciega su entrada antes de enviarla y desciega la respuesta al recibirla. El navegador procesa la contraseña con Argon2id y después ejecuta una OPRF con umbral (función pseudoaleatoria ciega) con dos servidores independientes alojados en países separados. Cada servidor posee solo una parte, y ambos deben responder para que la derivación tenga éxito. A partir del resultado, el navegador deriva el par de claves de la persona usuaria y la clave que desenvuelve la clave de la organización.
**Por qué importa.** Comprometer un servidor no reconstruye nada, porque una sola parte no puede producir la respuesta por sí sola. Un atacante necesita ambos servidores a la vez, en dos jurisdicciones legales, más la contraseña y el segundo factor. Una orden legal en un país anfitrión alcanza una parte que es inútil por sí sola, por lo que ninguna jurisdicción puede obligar a descifrar. Los dos servidores renuevan sus partes periódicamente, de modo que una parte capturada en un periodo es inútil contra el siguiente.`)
};

/**
* | output |
* | --- |
* | "CARE-Y never stores the keys that decrypt its data. They are computed from the password at each sign in, live only in browser memory, and are erased when the..." |
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