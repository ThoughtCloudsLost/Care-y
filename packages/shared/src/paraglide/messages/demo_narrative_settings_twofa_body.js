/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Twofa_BodyInputs */

const en_demo_narrative_settings_twofa_body = /** @type {(inputs: Demo_Narrative_Settings_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can enroll in any of the supported second factor methods from this page.
**Available methods.** Passkeys (platform authenticators and cross platform security keys), authenticator app codes (TOTP), email codes, text message codes, and push approval. Backup codes are generated automatically after the first method is enrolled.
**Enrollment flow.** Each method has its own enrollment sheet with setup instructions and verification. The simulator stands in for external devices by auto filling verification codes after a short delay, while the server side verification is real.`)
};

const es_demo_narrative_settings_twofa_body = /** @type {(inputs: Demo_Narrative_Settings_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden registrarse en cualquiera de los metodos de segundo factor admitidos desde esta pagina.
**Metodos disponibles.** Passkeys (autenticadores de plataforma y llaves de seguridad externas), codigos de aplicacion de autenticacion (TOTP), codigos por correo, codigos por mensaje de texto y aprobacion push. Los codigos de respaldo se generan automaticamente despues de registrar el primer metodo.
**Flujo de registro.** Cada metodo tiene su propia ventana de registro con instrucciones de configuracion y verificacion. El simulador sustituye dispositivos externos llenando automaticamente los codigos de verificacion tras una breve pausa, mientras que la verificacion del lado del servidor es real.`)
};

/**
* | output |
* | --- |
* | "Volunteers can enroll in any of the supported second factor methods from this page. **Available methods.** Passkeys (platform authenticators and cross platfo..." |
*
* @param {Demo_Narrative_Settings_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_twofa_body = /** @type {((inputs?: Demo_Narrative_Settings_Twofa_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Twofa_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_twofa_body(inputs)
	return es_demo_narrative_settings_twofa_body(inputs)
});