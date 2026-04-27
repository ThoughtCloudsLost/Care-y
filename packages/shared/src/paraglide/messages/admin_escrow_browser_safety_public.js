/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Browser_Safety_PublicInputs */

const en_admin_escrow_browser_safety_public = /** @type {(inputs: Admin_Escrow_Browser_Safety_PublicInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Don't do this on a shared or public computer`)
};

const es_admin_escrow_browser_safety_public = /** @type {(inputs: Admin_Escrow_Browser_Safety_PublicInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No haga esto en una computadora compartida o publica`)
};

/**
* | output |
* | --- |
* | "Don't do this on a shared or public computer" |
*
* @param {Admin_Escrow_Browser_Safety_PublicInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_public = /** @type {((inputs?: Admin_Escrow_Browser_Safety_PublicInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Browser_Safety_PublicInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_browser_safety_public(inputs)
	return es_admin_escrow_browser_safety_public(inputs)
});