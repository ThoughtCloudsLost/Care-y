/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Login_DescInputs */

const en_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The login screen is where volunteers sign in and where CARE-Y derives the encryption keys that protect all data in the system. Volunteers enter a username and password, then verify with a second factor before the app unlocks. The password never leaves the device. CARE-Y uses it locally to derive encryption keys through a protocol that requires two independent servers in separate countries to cooperate. This process takes a few seconds because the password function is intentionally slow, and the login screen shows each step as it completes. The screen carries your organization's logo, name, and brand palette from its public branding set during onboarding or in the admin settins page.`)
};

const es_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pantalla de inicio de sesión es donde las personas voluntarias inician sesión y donde CARE-Y deriva las claves de cifrado que protegen todos los datos del sistema. Se introduce un nombre de usuario y contraseña, y luego se verifica con un segundo factor antes de que la aplicación se desbloquee. La contraseña nunca sale del dispositivo. CARE-Y la usa localmente para derivar claves de cifrado a través de un protocolo que requiere la cooperación de dos servidores independientes en países separados. Este proceso tarda unos segundos porque la función de contraseña es intencionalmente lenta, y la pantalla de inicio de sesión muestra cada paso a medida que se completa. La pantalla lleva el logotipo, el nombre y la paleta de marca de tu organización desde su marca pública configurada durante la incorporación o en la página de configuración de administración.`)
};

/**
* | output |
* | --- |
* | "The login screen is where volunteers sign in and where CARE-Y derives the encryption keys that protect all data in the system. Volunteers enter a username an..." |
*
* @param {Demo_Section_Login_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_login_desc = /** @type {((inputs?: Demo_Section_Login_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Login_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_login_desc(inputs)
	return es_demo_section_login_desc(inputs)
});