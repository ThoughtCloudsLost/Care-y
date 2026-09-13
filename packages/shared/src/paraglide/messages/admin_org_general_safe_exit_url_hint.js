/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_General_Safe_Exit_Url_HintInputs */

const en_admin_org_general_safe_exit_url_hint = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Where the quick-exit button sends portal visitors. Leave blank for a default weather page.`)
};

const es_admin_org_general_safe_exit_url_hint = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adonde el boton de salida rapida envia a los visitantes del portal. Deje en blanco para una pagina de clima predeterminada.`)
};

/**
* | output |
* | --- |
* | "Where the quick-exit button sends portal visitors. Leave blank for a default weather page." |
*
* @param {Admin_Org_General_Safe_Exit_Url_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_safe_exit_url_hint = /** @type {((inputs?: Admin_Org_General_Safe_Exit_Url_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_Safe_Exit_Url_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_org_general_safe_exit_url_hint(inputs)
	return es_admin_org_general_safe_exit_url_hint(inputs)
});