/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Field_Config_HeadingInputs */

const en_demo_narrative_admin_field_config_heading = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Field settings`)
};

const es_demo_narrative_admin_field_config_heading = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuración de campo`)
};

const en_xa2_demo_narrative_admin_field_config_heading = /** @type {(inputs: Demo_Narrative_Admin_Field_Config_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìèld sèttìngs •••••⟧`)
};

/**
* | output |
* | --- |
* | "Field settings" |
*
* @param {Demo_Narrative_Admin_Field_Config_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_field_config_heading = /** @type {((inputs?: Demo_Narrative_Admin_Field_Config_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Field_Config_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_field_config_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_field_config_heading(inputs)
	return en_demo_narrative_admin_field_config_heading(inputs)
});