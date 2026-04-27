/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Browser_Safety_ExtensionsInputs */

const en_admin_escrow_browser_safety_extensions = /** @type {(inputs: Admin_Escrow_Browser_Safety_ExtensionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disable browser extensions, or use a private/incognito window (most extensions are disabled by default in incognito)`)
};

const es_admin_escrow_browser_safety_extensions = /** @type {(inputs: Admin_Escrow_Browser_Safety_ExtensionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desactive las extensiones del navegador, o use una ventana privada/incognito (la mayoria de las extensiones estan desactivadas por defecto en incognito)`)
};

/**
* | output |
* | --- |
* | "Disable browser extensions, or use a private/incognito window (most extensions are disabled by default in incognito)" |
*
* @param {Admin_Escrow_Browser_Safety_ExtensionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_extensions = /** @type {((inputs?: Admin_Escrow_Browser_Safety_ExtensionsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Browser_Safety_ExtensionsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_browser_safety_extensions(inputs)
	return es_admin_escrow_browser_safety_extensions(inputs)
});