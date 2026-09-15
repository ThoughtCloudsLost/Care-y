/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Thread_BodyInputs */

const en_demo_narrative_client_account_thread_body = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`After signing in, the account page shows the same message thread and composer as the secure link portal, and the client can close the browser, return later, sign in again, and resume the conversation where it left off.
**Encryption.** The account thread derives decryption keys from the password rather than the URL fragment, but the encryption and reply lifecycle are otherwise identical to the secure link portal. A fresh client reply is readable by any user who holds the organization key until the first user opens it, after which only holders of per ticket key wraps can read it.
**Persistence.** The client's message copies on the portal channel are dropped after 30 days of channel inactivity, while the organization's own record of the conversation is stored separately under the per ticket key and follows its own retention rules.`)
};

const es_demo_narrative_client_account_thread_body = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Después de iniciar sesión, la página de cuenta muestra el mismo hilo de mensajes y compositor que el portal de enlace seguro, y el cliente puede cerrar el navegador, regresar después, iniciar sesión de nuevo y reanudar la conversación donde la dejó.
**Cifrado.** El hilo de la cuenta deriva las claves de descifrado de la contraseña en lugar del fragmento de la URL, pero el cifrado y el ciclo de vida de las respuestas son por lo demás idénticos al portal de enlace seguro. Una respuesta reciente del cliente es legible por la persona usuaria que posea la clave de la organización hasta que la primera persona usuaria la abra, tras lo cual solo quienes posean envolvimientos de la clave del caso pueden leerla.
**Persistencia.** Las copias de mensajes del cliente en el canal del portal se eliminan después de 30 días de inactividad, mientras que el registro propio de la organización sobre la conversación se almacena por separado bajo la clave del caso y sigue sus propias reglas de retención.`)
};

/**
* | output |
* | --- |
* | "After signing in, the account page shows the same message thread and composer as the secure link portal, and the client can close the browser, return later, ..." |
*
* @param {Demo_Narrative_Client_Account_Thread_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_thread_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Thread_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Thread_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_thread_body(inputs)
	return en_demo_narrative_client_account_thread_body(inputs)
});