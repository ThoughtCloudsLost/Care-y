/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_BodyInputs */

const en_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A second factor is required alongside the password, and every request for encrypted content is refused on a session that has not cleared its second factor.
**Available methods.** Five kinds of second factor can be enrolled. A passkey covers both a device's own screen lock and a separate physical security key, and the other four are an authenticator app, a code sent by email, a code sent by text message, and a push approval on another device. More than one can be enrolled at a time, and a set of backup codes is generated as soon as the first method is enrolled.
**First sign in.** A user with nothing enrolled yet is not challenged, because there is nothing to challenge with. That sign in derives the encryption keys first and lands on enrollment afterward, so on that one occasion the keys exist before any second factor has been proven, and the session stays unable to read ticket data until enrollment finishes and marks it verified.
**Why more than one method.** Each enrolled method is an independent way back in, and since CARE-Y has no password or account recovery path, a user whose only method sits on a lost device has nothing left but the backup codes, and for that reason the product refuses to remove the last enrolled method.`)
};

const es_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Además de la contraseña se exige un segundo factor, y toda petición de contenido cifrado se rechaza en una sesión que no ha superado su segundo factor.
**Métodos disponibles.** Pueden registrarse cinco tipos de segundo factor. Una passkey cubre tanto el bloqueo de pantalla del propio dispositivo como una llave de seguridad física aparte, y los otros cuatro son una aplicación de autenticación, un código por correo, un código por mensaje de texto y una aprobación push en otro dispositivo. Se puede tener más de uno registrado a la vez, y en cuanto se registra el primero se genera un juego de códigos de respaldo.
**Primer inicio de sesión.** A la persona usuaria que todavía no tiene nada registrado no se le plantea ningún desafío, porque no hay con qué plantearlo. Ese inicio de sesión deriva primero las claves de cifrado y desemboca después en el registro, de modo que en esa única ocasión las claves existen antes de haber demostrado ningún segundo factor, y la sesión sigue sin poder leer datos de tickets hasta que el registro termina y la marca como verificada.
**Por qué más de un método.** Cada método registrado es una vía de entrada independiente y, como CARE-Y no tiene ninguna ruta de recuperación de contraseña ni de cuenta, a la persona usuaria cuyo único método está en un dispositivo perdido no le quedan más que los códigos de respaldo, y por esa razón el producto se niega a eliminar el último método registrado.`)
};

/**
* | output |
* | --- |
* | "A second factor is required alongside the password, and every request for encrypted content is refused on a session that has not cleared its second factor. *..." |
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