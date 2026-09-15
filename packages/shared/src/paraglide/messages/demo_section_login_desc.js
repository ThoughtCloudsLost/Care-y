/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Login_DescInputs */

const en_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The login screen is where the user signs in and where the browser turns the password into the encryption keys that make organization data readable. This section covers language choice, username and password with the defenses behind them, five methods for the second factor and backup codes, and key derivation. The screen takes its name, logo, and colors from the organization's public branding, which is set during onboarding and changeable later from the admin pages.`)
};

const es_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pantalla de inicio de sesión es donde se inicia sesión y donde el navegador transforma la contraseña en las claves de cifrado que hacen legibles los datos de la organización. Esta sección cubre la elección de idioma, nombre de usuario y contraseña con las defensas que los respaldan, cinco métodos para el segundo factor y códigos de respaldo, y la derivación de claves. La pantalla toma su nombre, logotipo y colores de la marca pública de la organización, que se establece durante la incorporación y puede cambiarse después desde las páginas de administración.`)
};

/**
* | output |
* | --- |
* | "The login screen is where the user signs in and where the browser turns the password into the encryption keys that make organization data readable. This sect..." |
*
* @param {Demo_Section_Login_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_login_desc = /** @type {((inputs?: Demo_Section_Login_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Login_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_login_desc(inputs)
	return en_demo_section_login_desc(inputs)
});