/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Browser_Safety_HeadingInputs */

const en_admin_escrow_browser_safety_heading = /** @type {(inputs: Admin_Escrow_Browser_Safety_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Before you continue`)
};

const es_admin_escrow_browser_safety_heading = /** @type {(inputs: Admin_Escrow_Browser_Safety_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Antes de continuar`)
};

/**
* | output |
* | --- |
* | "Before you continue" |
*
* @param {Admin_Escrow_Browser_Safety_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_heading = /** @type {((inputs?: Admin_Escrow_Browser_Safety_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Browser_Safety_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_browser_safety_heading(inputs)
	return es_admin_escrow_browser_safety_heading(inputs)
});