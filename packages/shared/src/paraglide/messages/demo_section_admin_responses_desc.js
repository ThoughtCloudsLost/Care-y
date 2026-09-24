/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Responses_DescInputs */

const en_demo_section_admin_responses_desc = /** @type {(inputs: Demo_Section_Admin_Responses_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Responses are the one form artifact encrypted to private keys rather than the derivable key used for form definitions, and reading them requires a separate permission from building forms.`)
};

const es_demo_section_admin_responses_desc = /** @type {(inputs: Demo_Section_Admin_Responses_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las respuestas son el único artefacto de formulario cifrado con claves privadas en lugar de la clave derivable que se usa para las definiciones, y leerlas requiere un permiso distinto del de construir formularios.`)
};

const en_xa2_demo_section_admin_responses_desc = /** @type {(inputs: Demo_Section_Admin_Responses_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèspònsès àrè thè ònè fòrm àrtìfàct èncryptèd tò prìvàtè kèys ràthèr thàn thè dèrìvàblè kèy ùsèd fòr fòrm dèfìnìtìòns, ànd rèàdìng thèm rèqùìrès à sèpàràtè pèrmìssìòn fròm bùìldìng fòrms. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Responses are the one form artifact encrypted to private keys rather than the derivable key used for form definitions, and reading them requires a separate p..." |
*
* @param {Demo_Section_Admin_Responses_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_responses_desc = /** @type {((inputs?: Demo_Section_Admin_Responses_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Responses_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_responses_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_responses_desc(inputs)
	return en_demo_section_admin_responses_desc(inputs)
});