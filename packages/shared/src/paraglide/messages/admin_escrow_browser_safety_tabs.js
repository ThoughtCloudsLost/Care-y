/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Browser_Safety_TabsInputs */

const en_admin_escrow_browser_safety_tabs = /** @type {(inputs: Admin_Escrow_Browser_Safety_TabsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Close other browser tabs and apps you don't need`)
};

const es_admin_escrow_browser_safety_tabs = /** @type {(inputs: Admin_Escrow_Browser_Safety_TabsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cierre otras pestanas del navegador y aplicaciones que no necesite`)
};

const en_xa2_admin_escrow_browser_safety_tabs = /** @type {(inputs: Admin_Escrow_Browser_Safety_TabsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsè òthèr bròwsèr tàbs ànd àpps yòù dòn't nèèd •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Close other browser tabs and apps you don't need" |
*
* @param {Admin_Escrow_Browser_Safety_TabsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_tabs = /** @type {((inputs?: Admin_Escrow_Browser_Safety_TabsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Browser_Safety_TabsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_browser_safety_tabs(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_browser_safety_tabs(inputs)
	return en_admin_escrow_browser_safety_tabs(inputs)
});