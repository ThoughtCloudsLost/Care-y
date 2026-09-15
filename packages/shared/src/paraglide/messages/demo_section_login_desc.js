/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Login_DescInputs */

const en_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The login screen is where a user signs in and where the browser turns the password into the encryption keys that make the organization's data readable. The entries in this section cover the language choice offered before sign in, the username and password step with the defenses that stand behind it, the five kinds of second factor and the backup codes that come with them, and how the encryption keys are derived. The screen takes its name, logo, and colors from the organization's public branding, which is set during onboarding and can be changed later from the administration pages.`)
};

const es_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pantalla de inicio de sesión es donde se accede a la aplicación y donde el navegador convierte la contraseña en las claves de cifrado que hacen legibles los datos de la organización. Las entradas de esta sección cubren la elección de idioma que se ofrece antes de iniciar sesión, el paso de nombre de usuario y contraseña con las defensas que lo respaldan, los cinco tipos de segundo factor y los códigos de respaldo que los acompañan, y cómo se derivan las claves de cifrado. La pantalla toma su nombre, su logotipo y sus colores de la marca pública de la organización, que se configura durante la incorporación y puede cambiarse después desde las páginas de administración.`)
};

/**
* | output |
* | --- |
* | "The login screen is where a user signs in and where the browser turns the password into the encryption keys that make the organization's data readable. The e..." |
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