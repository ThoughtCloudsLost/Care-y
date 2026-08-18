/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Credentials_BodyInputs */

const en_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers sign in with a username and password assigned by their organization. The password is never sent to the server in any form.
When you submit your password, CARE-Y runs it through **Argon2id**, a function that transforms it into a value that is extremely difficult to reverse, even with dedicated hardware. This function is intentionally slow and memory intensive, which makes it costly for an attacker to try large numbers of guesses. The result becomes the starting point for deriving encryption keys.
The login screen updates its label through each step of the process so volunteers know the app is working, not frozen. Even if someone intercepts network traffic between the device and the server, they cannot recover the original password from what was transmitted.`)
};

const es_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las personas voluntarias inician sesion con un nombre de usuario y contrasena asignados por su organizacion. La contrasena nunca se envia al servidor en ninguna forma.
Al enviar la contrasena, CARE-Y la procesa con **Argon2id**, una funcion que la transforma en un valor extremadamente dificil de revertir, incluso con hardware dedicado. Esta funcion es intencionalmente lenta y consume mucha memoria, lo que hace costoso para un atacante probar grandes cantidades de intentos. El resultado se convierte en el punto de partida para derivar las claves de cifrado.
La pantalla de inicio de sesion actualiza su etiqueta a traves de cada paso del proceso para que las personas voluntarias sepan que la aplicacion esta trabajando, no congelada. Aunque alguien intercepte el trafico de red entre el dispositivo y el servidor, no puede recuperar la contrasena original de lo que se transmitio.`)
};

/**
* | output |
* | --- |
* | "Volunteers sign in with a username and password assigned by their organization. The password is never sent to the server in any form. When you submit your pa..." |
*
* @param {Demo_Narrative_Topic_Credentials_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_credentials_body = /** @type {((inputs?: Demo_Narrative_Topic_Credentials_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Credentials_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_credentials_body(inputs)
	return es_demo_narrative_topic_credentials_body(inputs)
});