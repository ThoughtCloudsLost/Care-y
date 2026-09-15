/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Credentials_BodyInputs */

const en_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign in is username plus password. The username is a login name, not an email address, and it is chosen by the person accepting an invitation or set by an administrator who creates the account by hand. Passwords for accounts on the organization side must be between 16 and 256 characters, checked in the browser and again on the server.
**What the server holds.** The server stores a scrypt hash, never the password. A stolen database cannot be turned back into credentials, and guessing against the hash is deliberately expensive. The password does reach the server under TLS at each sign in and is checked against the stored hash.
**How it works.** The browser runs its own key derivation from the password at each sign in, and that leg never reveals the password to the server. Argon2id runs first, fixed at 64 MB of memory and 4 passes, and these parameters live in the browser's own code rather than being sent by the server, so a compromised server cannot request cheaper settings.
**Unknown usernames.** An attempt on a nonexistent username follows the same path as a real one. The browser needs the account's salt before it can stretch the password, and for a nonexistent name the server computes a deterministic fake salt from an internal key rather than returning an error. The password check runs against a throwaway hash so timing matches. On a running CARE-Y server, the salt lookup is capped at 20 per minute per address, and the demo leaves it open.
**Rate limiting.** On a running CARE-Y server, sign in attempts are capped at 5 per minute per address, and requests for key derivation are capped at 10 per account and 50 per address per 15 minutes. Past 5 derivation attempts in that window the server demands a proof of work puzzle the browser must solve before the request is answered, and the puzzle hardens as attempts accumulate with added delays of 2, 5, and 10 seconds from the 6th, 8th, and 10th attempt. Limits count attempts, not failures, because the derivation step is blind by design and the server cannot tell a correct guess from a wrong one. The demo wires every limiter to accept whatever it is given.
**No lockout.** No lockout exists and the product carries no lockout state at all, which means nobody can use the sign in screen to shut a user out of their own account. The rate limits that do apply expire on their own.
**No recovery.** There is no password recovery of any kind and no reset link, and an administrator cannot set a new password on someone else's account because changing a password requires the current one. A lost password means the account is gone, but the organization's cases are not: each case key is wrapped separately for every user who has access, so everyone else's copy remains readable and an administrator creates a replacement account.
**If it fails.** A refused sign in shows the same message whether the username was wrong, the password was wrong, or the account does not exist, and a sign in stopped by the rate limit is no more specific. CARE-Y withholds detail wherever a fuller message would tell an attacker something worth knowing.`)
};

const es_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El inicio de sesión requiere nombre de usuario y contraseña. El nombre de usuario es un identificador de inicio de sesión, no una dirección de correo electrónico, y lo elige la persona que acepta una invitación o lo establece una persona administradora que crea la cuenta a mano. Las contraseñas de cuentas en el lado de la organización deben tener entre 16 y 256 caracteres, y se comprueban en el navegador y de nuevo en el servidor.
**Lo que almacena el servidor.** El servidor guarda un hash scrypt, nunca la contraseña. Una base de datos robada no puede convertirse en credenciales, y adivinar contra el hash es deliberadamente costoso. La contraseña sí llega al servidor bajo TLS en cada inicio de sesión y se comprueba contra el hash almacenado.
**Cómo funciona.** El navegador ejecuta su propia derivación de claves a partir de la contraseña en cada inicio de sesión, y esa rama nunca revela la contraseña al servidor. Argon2id se ejecuta primero, fijado en 64 MB de memoria y 4 pasadas, y estos parámetros viven en el propio código del navegador en lugar de ser enviados por el servidor, de modo que un servidor comprometido no puede solicitar una configuración más barata.
**Nombres de usuario desconocidos.** Un intento con un nombre de usuario inexistente sigue el mismo camino que uno real. El navegador necesita la sal de la cuenta antes de poder procesar la contraseña, y para un nombre inexistente el servidor calcula una sal falsa determinista a partir de una clave interna en lugar de devolver un error. La comprobación de contraseña se ejecuta contra un hash desechable para que los tiempos coincidan. En un servidor CARE-Y en funcionamiento, la búsqueda de sal está limitada a 20 por minuto por dirección, y la demo la deja abierta.
**Límites de frecuencia.** En un servidor CARE-Y en funcionamiento, los intentos de inicio de sesión están limitados a 5 por minuto por dirección, y las solicitudes para la derivación de claves están limitadas a 10 por cuenta y 50 por dirección cada 15 minutos. A partir de 5 intentos de derivación en esa ventana, el servidor exige un rompecabezas de prueba de trabajo que el navegador debe resolver antes de recibir respuesta, y el rompecabezas se endurece a medida que se acumulan los intentos con retardos añadidos de 2, 5 y 10 segundos a partir del 6.o, 8.o y 10.o intento. Los límites cuentan intentos, no fallos, porque el paso de derivación es ciego por diseño y el servidor no puede distinguir una respuesta correcta de una incorrecta. La demo configura cada limitador para que acepte lo que reciba.
**Sin bloqueo.** No existe ningún mecanismo de bloqueo y el producto no mantiene ningún estado de bloqueo, lo que significa que nadie puede usar la pantalla de inicio de sesión para impedir el acceso de otra persona a su propia cuenta. Los límites de frecuencia que sí se aplican expiran por sí solos.
**Sin recuperación.** No existe ningún tipo de recuperación de contraseña ni enlace de restablecimiento, y una persona administradora no puede establecer una contraseña nueva en la cuenta de otra persona porque cambiar la contraseña requiere la actual. Una contraseña perdida significa que la cuenta desaparece, pero los casos de la organización no: la clave de cada caso se envuelve por separado para cada persona que tiene acceso, de modo que la copia de las demás personas sigue siendo legible y la persona administradora crea una cuenta de reemplazo.
**Si falla.** Un inicio de sesión rechazado muestra el mismo mensaje tanto si el nombre de usuario era incorrecto, como si la contraseña era incorrecta o la cuenta no existe, y un inicio de sesión detenido por el límite de frecuencia tampoco es más específico. CARE-Y omite los detalles en cualquier situación donde un mensaje más completo le diría algo útil a un atacante.`)
};

/**
* | output |
* | --- |
* | "Sign in is username plus password. The username is a login name, not an email address, and it is chosen by the person accepting an invitation or set by an ad..." |
*
* @param {Demo_Narrative_Topic_Credentials_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_credentials_body = /** @type {((inputs?: Demo_Narrative_Topic_Credentials_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Credentials_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_credentials_body(inputs)
	return en_demo_narrative_topic_credentials_body(inputs)
});