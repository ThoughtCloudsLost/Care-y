/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Color_Contrast_NoteInputs */

const en_admin_branding_color_contrast_note = /** @type {(inputs: Admin_Branding_Color_Contrast_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Final colors may differ slightly. The app adjusts them automatically for readability and contrast.`)
};

const es_admin_branding_color_contrast_note = /** @type {(inputs: Admin_Branding_Color_Contrast_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los colores finales pueden variar ligeramente. La aplicacion los ajusta automaticamente para legibilidad y contraste.`)
};

/**
* | output |
* | --- |
* | "Final colors may differ slightly. The app adjusts them automatically for readability and contrast." |
*
* @param {Admin_Branding_Color_Contrast_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_contrast_note = /** @type {((inputs?: Admin_Branding_Color_Contrast_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_Contrast_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_color_contrast_note(inputs)
	return es_admin_branding_color_contrast_note(inputs)
});