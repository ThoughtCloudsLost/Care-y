/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Seam_Webauthn_AuthenticatorInputs */

const en_demo_flow_seam_webauthn_authenticator = /** @type {(inputs: Demo_Flow_Seam_Webauthn_AuthenticatorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The passkey authenticator is simulated in the page. On a real device the authenticator sits outside the browser tab and holds the key itself.`)
};

const es_demo_flow_seam_webauthn_authenticator = /** @type {(inputs: Demo_Flow_Seam_Webauthn_AuthenticatorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El autenticador de la llave de acceso se simula en la pagina. En un dispositivo real el autenticador esta fuera de la pestana del navegador y guarda la clave.`)
};

/**
* | output |
* | --- |
* | "The passkey authenticator is simulated in the page. On a real device the authenticator sits outside the browser tab and holds the key itself." |
*
* @param {Demo_Flow_Seam_Webauthn_AuthenticatorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_seam_webauthn_authenticator = /** @type {((inputs?: Demo_Flow_Seam_Webauthn_AuthenticatorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Seam_Webauthn_AuthenticatorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_seam_webauthn_authenticator(inputs)
	return es_demo_flow_seam_webauthn_authenticator(inputs)
});