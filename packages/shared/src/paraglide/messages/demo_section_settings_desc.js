/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Settings_DescInputs */

const en_demo_section_settings_desc = /** @type {(inputs: Demo_Section_Settings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The settings page lets volunteers update their profile, manage their password and encryption keys, configure appearance, and enroll in two factor authentication methods.`)
};

const es_demo_section_settings_desc = /** @type {(inputs: Demo_Section_Settings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de configuración permite a los voluntarios actualizar su perfil, gestionar su contraseña y claves de cifrado, configurar la apariencia y registrarse en métodos de autenticación de dos factores.`)
};

/**
* | output |
* | --- |
* | "The settings page lets volunteers update their profile, manage their password and encryption keys, configure appearance, and enroll in two factor authenticat..." |
*
* @param {Demo_Section_Settings_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_settings_desc = /** @type {((inputs?: Demo_Section_Settings_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Settings_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_settings_desc(inputs)
	return es_demo_section_settings_desc(inputs)
});