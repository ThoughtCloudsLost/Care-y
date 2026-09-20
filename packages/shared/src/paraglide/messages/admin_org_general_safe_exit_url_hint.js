/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Org_General_Safe_Exit_Url_HintInputs */

const en_admin_org_general_safe_exit_url_hint = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Where the quick-exit button sends portal visitors. Leave blank for a default weather page.`)
};

const es_admin_org_general_safe_exit_url_hint = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adónde el boton de salida rápida envia a los visitantes del portal. Deje en blanco para una página de clima predeterminada.`)
};

const en_xa2_admin_org_general_safe_exit_url_hint = /** @type {(inputs: Admin_Org_General_Safe_Exit_Url_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèrè thè qùìck-èxìt bùttòn sènds pòrtàl vìsìtòrs. Lèàvè blànk fòr à dèfàùlt wèàthèr pàgè. •••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Where the quick-exit button sends portal visitors. Leave blank for a default weather page." |
*
* @param {Admin_Org_General_Safe_Exit_Url_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_safe_exit_url_hint = /** @type {((inputs?: Admin_Org_General_Safe_Exit_Url_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Org_General_Safe_Exit_Url_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_org_general_safe_exit_url_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_org_general_safe_exit_url_hint(inputs)
	return en_admin_org_general_safe_exit_url_hint(inputs)
});