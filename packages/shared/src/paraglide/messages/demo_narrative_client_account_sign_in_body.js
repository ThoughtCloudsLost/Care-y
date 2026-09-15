/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Sign_In_BodyInputs */

const en_demo_narrative_client_account_sign_in_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_In_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The account page opens to a sign in form when there is no active session.
**How it works.** The password never leaves the device. Signing in derives encryption keys from it through a deliberately slow local computation combined with a server round trip.
**Session.** A successful sign in writes a session cookie with a 24 hour expiry and loads the client's conversation thread. Decryption keys live in page memory, and a 15 minute idle timer that warns at the ten minute mark zeros them and returns to the sign in form, so reloading or returning after inactivity means retyping the password.
**Unknown usernames.** The server answers unknown usernames with a deterministic fake salt and runs the same comparison path it uses for real accounts, so a wrong password, a wrong username, and a nonexistent account all produce the same generic failure. The login side of account enumeration is fully defended. The creation side must tell the legitimate client when a username is taken, which means an attacker can probe usernames too, but the anonymous creation path sits behind the intake rate limit and proof of work, the in-portal path requires secure link channel authentication, and neither returns any other account data.`)
};

const es_demo_narrative_client_account_sign_in_body = /** @type {(inputs: Demo_Narrative_Client_Account_Sign_In_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de cuenta se abre con un formulario de inicio de sesión cuando no hay sesión activa.
**Cómo funciona.** La contraseña nunca sale del dispositivo. Iniciar sesión deriva las claves de cifrado a partir de ella mediante una computación local deliberadamente lenta combinada con una ida y vuelta al servidor.
**Sesión.** Un inicio de sesión exitoso escribe una cookie de sesión con una expiración de 24 horas y carga el hilo de conversación del cliente. Las claves de descifrado permanecen en la memoria de la página, y un temporizador de inactividad de 15 minutos que avisa a los diez minutos las elimina y devuelve la vista al formulario de inicio de sesión, de modo que recargar la página o regresar después de un periodo de inactividad requiere volver a escribir la contraseña.
**Nombres de usuario desconocidos.** El servidor responde a nombres de usuario desconocidos con una sal falsa determinista y ejecuta la misma ruta de comparación que usa para cuentas reales, de manera que una contraseña incorrecta, un nombre de usuario incorrecto y una cuenta inexistente producen el mismo mensaje genérico de error. La enumeración de cuentas desde el inicio de sesión está plenamente defendida. El lado de creación debe informar al cliente legítimo cuando un nombre de usuario ya está tomado, lo que significa que quien ataque también puede sondear nombres de usuario, pero la ruta de creación anónima está detrás del límite de frecuencia de admisión y la prueba de trabajo, la ruta dentro del portal requiere autenticación de canal de enlace seguro, y ninguna de las dos devuelve datos adicionales de la cuenta.`)
};

/**
* | output |
* | --- |
* | "The account page opens to a sign in form when there is no active session. **How it works.** The password never leaves the device. Signing in derives encrypti..." |
*
* @param {Demo_Narrative_Client_Account_Sign_In_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_sign_in_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Sign_In_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Sign_In_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_sign_in_body(inputs)
	return en_demo_narrative_client_account_sign_in_body(inputs)
});