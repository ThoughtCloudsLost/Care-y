/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Color_Contrast_NoteInputs */

const en_admin_branding_color_contrast_note = /** @type {(inputs: Admin_Branding_Color_Contrast_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Final colors may differ slightly. The app adjusts them automatically for readability and contrast.`)
};

const es_admin_branding_color_contrast_note = /** @type {(inputs: Admin_Branding_Color_Contrast_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los colores finales pueden variar ligeramente. La aplicación los ajusta automáticamente para legibilidad y contraste.`)
};

const en_xa2_admin_branding_color_contrast_note = /** @type {(inputs: Admin_Branding_Color_Contrast_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìnàl còlòrs mày dìffèr slìghtly. Thè àpp àdjùsts thèm àùtòmàtìcàlly fòr rèàdàbìlìty ànd còntràst. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Final colors may differ slightly. The app adjusts them automatically for readability and contrast." |
*
* @param {Admin_Branding_Color_Contrast_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_contrast_note = /** @type {((inputs?: Admin_Branding_Color_Contrast_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Color_Contrast_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_color_contrast_note(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_color_contrast_note(inputs)
	return en_admin_branding_color_contrast_note(inputs)
});