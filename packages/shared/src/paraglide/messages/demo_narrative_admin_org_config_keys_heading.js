/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Org_Config_Keys_HeadingInputs */

const en_demo_narrative_admin_org_config_keys_heading = /** @type {(inputs: Demo_Narrative_Admin_Org_Config_Keys_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization config and encryption keys`)
};

const es_demo_narrative_admin_org_config_keys_heading = /** @type {(inputs: Demo_Narrative_Admin_Org_Config_Keys_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuracion de la organizacion y claves de cifrado`)
};

/**
* | output |
* | --- |
* | "Organization config and encryption keys" |
*
* @param {Demo_Narrative_Admin_Org_Config_Keys_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_org_config_keys_heading = /** @type {((inputs?: Demo_Narrative_Admin_Org_Config_Keys_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Org_Config_Keys_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_org_config_keys_heading(inputs)
	return es_demo_narrative_admin_org_config_keys_heading(inputs)
});