/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Password_BodyInputs */

const en_demo_narrative_settings_password_body = /** @type {(inputs: Demo_Narrative_Settings_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Changing a password runs the full key derivation pipeline. The browser processes the password through Argon2id, performs the OPRF exchange with the threshold servers, and re-wraps the cryptographic keys.
**What happens during a password change.** The browser derives new encryption keys from the new password, then re-wraps the organization key and every ticket key the volunteer has access to under the new keys. This means the volunteer's encrypted data remains accessible without re-encrypting the data itself. The old password is verified, the new password is hashed, all key wraps are rotated, and other active sessions are terminated, all in a single atomic server call.
**What the server sees.** The server never sees the plaintext of the new private key. It receives only the re-wrapped key material, which is encrypted and only decryptable by the volunteer.`)
};

const es_demo_narrative_settings_password_body = /** @type {(inputs: Demo_Narrative_Settings_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar la contraseña ejecuta el proceso completo de derivación de claves. El navegador procesa la contraseña con Argon2id, realiza el intercambio OPRF con los servidores de umbral y re-envuelve las claves criptográficas.
**Qué ocurre durante un cambio de contraseña.** El navegador deriva nuevas claves de cifrado a partir de la nueva contraseña, luego re-envuelve la clave de la organización y cada clave de ticket a la que el voluntario tiene acceso bajo las nuevas claves. La contraseña anterior se verifica, la nueva se procesa, todos los envolvimientos de claves se rotan y las demás sesiones activas se terminan, todo en una única llamada atómica al servidor.
**Lo que ve el servidor.** El servidor nunca ve el texto plano de la nueva clave privada. Recibe solo el material de claves re-envuelto, que está cifrado y solo puede descifrarlo el voluntario.`)
};

const en_xa2_demo_narrative_settings_password_body = /** @type {(inputs: Demo_Narrative_Settings_Password_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngìng à pàsswòrd rùns thè fùll kèy dèrìvàtìòn pìpèlìnè. Thè bròwsèr pròcèssès thè pàsswòrd thròùgh Àrgòn2ìd, pèrfòrms thè ÒPRF èxchàngè wìth thè thrèshòld sèrvèrs, ànd rè-wràps thè cryptògràphìc kèys.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt hàppèns dùrìng à pàsswòrd chàngè. ••••••••••••** Thè bròwsèr dèrìvès nèw èncryptìòn kèys fròm thè nèw pàsswòrd, thèn rè-wràps thè òrgànìzàtìòn kèy ànd èvèry tìckèt kèy thè vòlùntèèr hàs àccèss tò ùndèr thè nèw kèys. Thìs mèàns thè vòlùntèèr's èncryptèd dàtà rèmàìns àccèssìblè wìthòùt rè-èncryptìng thè dàtà ìtsèlf. Thè òld pàsswòrd ìs vèrìfìèd, thè nèw pàsswòrd ìs hàshèd, àll kèy wràps àrè ròtàtèd, ànd òthèr àctìvè sèssìòns àrè tèrmìnàtèd, àll ìn à sìnglè àtòmìc sèrvèr càll.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr sèès. •••••••** Thè sèrvèr nèvèr sèès thè plàìntèxt òf thè nèw prìvàtè kèy. Ìt rècèìvès ònly thè rè-wràppèd kèy màtèrìàl, whìch ìs èncryptèd ànd ònly dècryptàblè by thè vòlùntèèr. ••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Changing a password runs the full key derivation pipeline. The browser processes the password through Argon2id, performs the OPRF exchange with the threshold..." |
*
* @param {Demo_Narrative_Settings_Password_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_password_body = /** @type {((inputs?: Demo_Narrative_Settings_Password_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Password_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_password_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_password_body(inputs)
	return en_demo_narrative_settings_password_body(inputs)
});