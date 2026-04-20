/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Icons_ErrorInputs */

const en_admin_branding_icons_error = /** @type {(inputs: Admin_Branding_Icons_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`App icon generation failed. Logo saved, but icons may not update.`)
};

const es_admin_branding_icons_error = /** @type {(inputs: Admin_Branding_Icons_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Error al generar iconos. El logo se guardó, pero los iconos pueden no actualizarse.`)
};

/**
* | output |
* | --- |
* | "App icon generation failed. Logo saved, but icons may not update." |
*
* @param {Admin_Branding_Icons_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_icons_error = /** @type {((inputs?: Admin_Branding_Icons_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Icons_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_icons_error(inputs)
	return es_admin_branding_icons_error(inputs)
});