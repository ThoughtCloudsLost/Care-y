/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Settings_DescInputs */

const en_demo_section_settings_desc = /** @type {(inputs: Demo_Section_Settings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Profile, password and encryption key management, appearance, and two factor authentication enrollment.`)
};

const es_demo_section_settings_desc = /** @type {(inputs: Demo_Section_Settings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Perfil, gestión de contraseña y claves de cifrado, apariencia y registro de autenticación de dos factores.`)
};

const en_xa2_demo_section_settings_desc = /** @type {(inputs: Demo_Section_Settings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pròfìlè, pàsswòrd ànd èncryptìòn kèy mànàgèmènt, àppèàràncè, ànd twò fàctòr àùthèntìcàtìòn ènròllmènt. •••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Profile, password and encryption key management, appearance, and two factor authentication enrollment." |
*
* @param {Demo_Section_Settings_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_settings_desc = /** @type {((inputs?: Demo_Section_Settings_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Settings_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_settings_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_settings_desc(inputs)
	return en_demo_section_settings_desc(inputs)
});