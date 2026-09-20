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

const en_xa2_admin_escrow_browser_safety_heading = /** @type {(inputs: Admin_Escrow_Browser_Safety_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bèfòrè yòù còntìnùè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Before you continue" |
*
* @param {Admin_Escrow_Browser_Safety_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_heading = /** @type {((inputs?: Admin_Escrow_Browser_Safety_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Browser_Safety_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_browser_safety_heading(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_browser_safety_heading(inputs)
	return en_admin_escrow_browser_safety_heading(inputs)
});