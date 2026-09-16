/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Login_DescInputs */

const en_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The login screen is where the browser turns a password into the encryption keys that make organization data readable. Everything in this section is a step in that transaction or a defense on it, and the screen draws its name, logo, and colors from the organization's branding.`)
};

const es_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pantalla de inicio de sesión es donde el navegador transforma una contraseña en las claves de cifrado que hacen legibles los datos de la organización. Todo en esta sección es un paso de esa operación o una defensa sobre ella, y la pantalla toma su nombre, logotipo y colores de la marca de la organización.`)
};

/**
* | output |
* | --- |
* | "The login screen is where the browser turns a password into the encryption keys that make organization data readable. Everything in this section is a step in..." |
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