/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Preview_ButtonsInputs */

const en_admin_branding_preview_buttons = /** @type {(inputs: Admin_Branding_Preview_ButtonsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buttons`)
};

const es_admin_branding_preview_buttons = /** @type {(inputs: Admin_Branding_Preview_ButtonsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Botones`)
};

const en_xa2_admin_branding_preview_buttons = /** @type {(inputs: Admin_Branding_Preview_ButtonsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bùttòns •••⟧`)
};

/**
* | output |
* | --- |
* | "Buttons" |
*
* @param {Admin_Branding_Preview_ButtonsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_branding_preview_buttons = /** @type {((inputs?: Admin_Branding_Preview_ButtonsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Preview_ButtonsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_branding_preview_buttons(inputs)
	if (locale === "en-XA") return en_xa2_admin_branding_preview_buttons(inputs)
	return en_admin_branding_preview_buttons(inputs)
});