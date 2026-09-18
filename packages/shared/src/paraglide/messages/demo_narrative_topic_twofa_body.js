/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_BodyInputs */

const en_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A password alone is not enough to access case data. Every sign-in also requires a second factor to confirm your identity through a separate channel.
Five methods are available: authenticator apps, passkeys, email codes, SMS codes, and push approval. You can enroll more than one method at a time, and each works independently. The system generates a set of one-time backup codes when you first enroll. You cannot remove your last remaining method.
**Encryption.** Until you complete a second-factor check, your session cannot read any encrypted case data, even if your password was correct.`)
};

const es_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una contraseña por sí sola no basta para acceder a los datos de los casos. Cada inicio de sesión también requiere un segundo factor para confirmar la identidad a través de un canal separado.
Hay cinco métodos disponibles: aplicaciones de autenticación, passkeys, códigos por correo electrónico, códigos por SMS y aprobación push. Se puede inscribir más de un método a la vez, y cada uno funciona de forma independiente. El sistema genera un conjunto de códigos de respaldo de un solo uso con la primera inscripción. No se puede eliminar el último método restante.
**Cifrado.** Hasta que se completa una verificación de segundo factor, la sesión no puede leer ningún dato cifrado de los casos, aunque la contraseña haya sido correcta.`)
};

/**
* | output |
* | --- |
* | "A password alone is not enough to access case data. Every sign-in also requires a second factor to confirm your identity through a separate channel. Five met..." |
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