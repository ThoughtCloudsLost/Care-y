/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Logo_HintInputs */

const en_admin_branding_logo_hint = /** @type {(inputs: Admin_Branding_Logo_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Appears in the app and on client-facing pages.`)
};

const es_admin_branding_logo_hint = /** @type {(inputs: Admin_Branding_Logo_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aparece en la aplicacion y en las paginas para clientes.`)
};

/**
* | output |
* | --- |
* | "Appears in the app and on client-facing pages." |
*
* @param {Admin_Branding_Logo_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_logo_hint = /** @type {((inputs?: Admin_Branding_Logo_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Logo_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_logo_hint(inputs)
	return es_admin_branding_logo_hint(inputs)
});