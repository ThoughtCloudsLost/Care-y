/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Browser_Safety_ScreenInputs */

const en_admin_escrow_browser_safety_screen = /** @type {(inputs: Admin_Escrow_Browser_Safety_ScreenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Make sure no screen sharing or recording is active`)
};

const es_admin_escrow_browser_safety_screen = /** @type {(inputs: Admin_Escrow_Browser_Safety_ScreenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asegurese de que no haya comparticion o grabacion de pantalla activa`)
};

/**
* | output |
* | --- |
* | "Make sure no screen sharing or recording is active" |
*
* @param {Admin_Escrow_Browser_Safety_ScreenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_screen = /** @type {((inputs?: Admin_Escrow_Browser_Safety_ScreenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Browser_Safety_ScreenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_browser_safety_screen(inputs)
	return es_admin_escrow_browser_safety_screen(inputs)
});