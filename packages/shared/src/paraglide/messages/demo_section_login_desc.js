/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Login_DescInputs */

const en_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Authentication in CARE-Y protects more than your account. The login flow derives the encryption keys that guard every piece of data in the system. No password is ever sent to the server, and no key material is stored there.`)
};

const es_demo_section_login_desc = /** @type {(inputs: Demo_Section_Login_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La autenticacion en CARE-Y protege mas que tu cuenta. El flujo de inicio de sesion deriva las claves de cifrado que protegen cada dato del sistema. Ninguna contrasena se envia al servidor, y ningun material criptografico se almacena alli.`)
};

/**
* | output |
* | --- |
* | "Authentication in CARE-Y protects more than your account. The login flow derives the encryption keys that guard every piece of data in the system. No passwor..." |
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