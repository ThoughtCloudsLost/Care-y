/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_BodyInputs */

const en_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A second factor is required alongside the password, and any request for encrypted content is refused on a session that has not cleared its second factor. The five enrollable methods are passkey, authenticator app, email code, text message code, and push approval, and the passkey method covers both a device's own screen lock and a separate physical security key. More than one method can be enrolled at once, and each enrolled method is an independent way back in. Backup codes are generated as soon as the first method is enrolled.
**First sign in.** A user with nothing enrolled is not challenged, because there is nothing to challenge with. That sign in derives the encryption keys first and lands on enrollment afterward, so on that one occasion keys exist before any second factor has been proven. The session stays unable to read ticket data until enrollment finishes and marks it verified.
**No recovery path.** Because there is no password or account recovery path, a user whose only method sits on a lost device has nothing left but the backup codes, and for that reason the product refuses to remove the last enrolled method.`)
};

const es_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se requiere un segundo factor junto con la contraseña, y toda solicitud de contenido cifrado se rechaza en una sesión que no haya superado su segundo factor. Los cinco métodos registrables son passkey, aplicación de autenticación, código por correo, código por mensaje de texto y aprobación push, y el método de passkey abarca tanto el bloqueo de pantalla del propio dispositivo como una llave de seguridad física separada. Se puede registrar más de un método a la vez, y cada método registrado es una vía independiente de regreso. Los códigos de respaldo se generan en cuanto se registra el primer método.
**Primer inicio de sesión.** Si no se ha registrado ningún método, no se solicita verificación porque no hay nada con qué verificar. Ese inicio de sesión deriva las claves de cifrado primero y llega al registro de métodos después, de modo que en esa única ocasión las claves existen antes de que se haya probado ningún segundo factor. La sesión no puede leer los datos de los casos hasta que el registro finalice y la marque como verificada.
**Sin vía de recuperación.** Como no existe ninguna vía de recuperación de contraseña o cuenta, la persona usuaria cuyo único método está en un dispositivo perdido no tiene más recurso que los códigos de respaldo, y por esa razón el producto se niega a eliminar el último método registrado.`)
};

/**
* | output |
* | --- |
* | "A second factor is required alongside the password, and any request for encrypted content is refused on a session that has not cleared its second factor. The..." |
*
* @param {Demo_Narrative_Topic_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_body(inputs)
	return en_demo_narrative_topic_twofa_body(inputs)
});