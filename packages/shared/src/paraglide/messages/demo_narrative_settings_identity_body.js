/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Identity_BodyInputs */

const en_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can change their display name and username from this page.
**Display name.** The display name is encrypted with the organization key in the browser before being sent to the server. This is the name shown to other org members. 
**Username.** The username is sent to the server in plaintext (protected by TLS in transit) because it is used for authentication lookup, and the server re-encrypts it on receipt.`)
};

const es_demo_narrative_settings_identity_body = /** @type {(inputs: Demo_Narrative_Settings_Identity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden cambiar su nombre visible y su nombre de usuario desde esta página.
**Nombre visible.** El nombre visible se cifra con la clave de la organización en el navegador antes de enviarse al servidor. Este es el nombre que se muestra a otros miembros de la organización.
**Nombre de usuario.** El nombre de usuario se envía al servidor en texto plano (protegido por TLS en tránsito) porque se usa para la búsqueda de autenticación, y el servidor lo re-cifra al recibirlo.`)
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