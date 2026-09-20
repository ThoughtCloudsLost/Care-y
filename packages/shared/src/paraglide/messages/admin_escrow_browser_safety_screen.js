/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Browser_Safety_ScreenInputs */

const en_admin_escrow_browser_safety_screen = /** @type {(inputs: Admin_Escrow_Browser_Safety_ScreenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Make sure no screen sharing or recording is active`)
};

const es_admin_escrow_browser_safety_screen = /** @type {(inputs: Admin_Escrow_Browser_Safety_ScreenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asegúrese de que no haya compartición o grabación de pantalla activa`)
};

const en_xa2_admin_escrow_browser_safety_screen = /** @type {(inputs: Admin_Escrow_Browser_Safety_ScreenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Màkè sùrè nò scrèèn shàrìng òr rècòrdìng ìs àctìvè •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Make sure no screen sharing or recording is active" |
*
* @param {Admin_Escrow_Browser_Safety_ScreenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_browser_safety_screen = /** @type {((inputs?: Admin_Escrow_Browser_Safety_ScreenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Browser_Safety_ScreenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_browser_safety_screen(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_browser_safety_screen(inputs)
	return en_admin_escrow_browser_safety_screen(inputs)
});