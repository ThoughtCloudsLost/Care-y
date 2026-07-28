/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs */

const en_demo_narrative_settings_two_factor_methods_body = /** @type {(inputs: Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You can enroll TOTP, email, or SMS as a second factor from this page. The demo stands in for your authenticator app and inbox by auto-filling the verification code after a short delay. The server-side verification is real. Enrolled methods persist in the demo database until you restart.`)
};

const es_demo_narrative_settings_two_factor_methods_body = /** @type {(inputs: Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Puedes registrar TOTP, correo electronico o SMS como segundo factor desde esta pagina. El demo sustituye tu aplicacion de autenticacion y tu bandeja de entrada llenando automaticamente el codigo de verificacion tras una breve pausa. La verificacion del servidor es real. Los metodos registrados persisten en la base de datos del demo hasta que reinicies.`)
};

/**
* | output |
* | --- |
* | "You can enroll TOTP, email, or SMS as a second factor from this page. The demo stands in for your authenticator app and inbox by auto-filling the verificatio..." |
*
* @param {Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_two_factor_methods_body = /** @type {((inputs?: Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Two_Factor_Methods_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_two_factor_methods_body(inputs)
	return es_demo_narrative_settings_two_factor_methods_body(inputs)
});