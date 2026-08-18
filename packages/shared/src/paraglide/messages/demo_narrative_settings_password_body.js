/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Password_BodyInputs */

const en_demo_narrative_settings_password_body = /** @type {(inputs: Demo_Narrative_Settings_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Changing a password runs the full key derivation pipeline. The browser processes the password through Argon2id, performs the OPRF exchange with the threshold servers, and re-wraps the cryptographic keys.
**What happens during a password change.** The browser derives new encryption keys from the new password, then re-wraps the organization key and every ticket key the volunteer has access to under the new keys. This means the volunteer's encrypted data remains accessible without re-encrypting the data itself. The old password is verified, the new password is hashed, all key wraps are rotated, and other active sessions are terminated, all in a single atomic server call.
**The server never sees the plaintext of the new private key.** It receives the re-wrapped key material, which is encrypted and only decryptable by the volunteer.`)
};

const es_demo_narrative_settings_password_body = /** @type {(inputs: Demo_Narrative_Settings_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar la contrasena ejecuta el proceso completo de derivacion de claves. El navegador procesa la contrasena con Argon2id, realiza el intercambio OPRF con los servidores de umbral y re-envuelve las claves criptograficas.
**Que ocurre durante un cambio de contrasena.** El navegador deriva nuevas claves de cifrado a partir de la nueva contrasena, luego re-envuelve la clave de la organizacion y cada clave de ticket a la que el voluntario tiene acceso bajo las nuevas claves. La contrasena anterior se verifica, la nueva se procesa, todos los envolvimientos de claves se rotan y las demas sesiones activas se terminan, todo en una unica llamada atomica al servidor.
**El servidor nunca ve el texto plano de la nueva clave privada.** Recibe el material de claves re-envuelto, que esta cifrado y solo puede descifrarlo el voluntario.`)
};

/**
* | output |
* | --- |
* | "Changing a password runs the full key derivation pipeline. The browser processes the password through Argon2id, performs the OPRF exchange with the threshold..." |
*
* @param {Demo_Narrative_Settings_Password_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_password_body = /** @type {((inputs?: Demo_Narrative_Settings_Password_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Password_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_password_body(inputs)
	return es_demo_narrative_settings_password_body(inputs)
});