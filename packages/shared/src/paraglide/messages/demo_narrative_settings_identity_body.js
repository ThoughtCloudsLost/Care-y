/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Identity_BodyInputs */

const en_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can change their display name and username from this page.
**Display name.** The display name is encrypted with the organization key in the browser before being sent to the server. The server stores ciphertext.
**Username.** The username is sent to the server in plaintext (protected by TLS in transit) because it is used for authentication lookup, and the server re-encrypts it on receipt.`)
};

const es_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden cambiar su nombre visible y su nombre de usuario desde esta pagina.
**Nombre visible.** El nombre visible se cifra con la clave de la organizacion en el navegador antes de enviarse al servidor. El servidor almacena texto cifrado.
**Nombre de usuario.** El nombre de usuario se envia al servidor en texto plano (protegido por TLS en transito) porque se usa para la busqueda de autenticacion, y el servidor lo re-cifra al recibirlo.`)
};

/**
* | output |
* | --- |
* | "Volunteers can change their display name and username from this page. **Display name.** The display name is encrypted with the organization key in the browse..." |
*
* @param {Demo_Narrative_Settings_Identity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_identity_body = /** @type {((inputs?: Demo_Narrative_Settings_Identity_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Identity_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_identity_body(inputs)
	return es_demo_narrative_settings_identity_body(inputs)
});