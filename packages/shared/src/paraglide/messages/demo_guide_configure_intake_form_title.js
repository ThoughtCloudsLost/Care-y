/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Configure_Intake_Form_TitleInputs */

const en_demo_guide_configure_intake_form_title = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure an intake form`)
};

const es_demo_guide_configure_intake_form_title = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar un formulario de admisión`)
};

const en_xa2_demo_guide_configure_intake_form_title = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìgùrè àn ìntàkè fòrm ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Configure an intake form" |
*
* @param {Demo_Guide_Configure_Intake_Form_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_configure_intake_form_title = /** @type {((inputs?: Demo_Guide_Configure_Intake_Form_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Configure_Intake_Form_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_configure_intake_form_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_configure_intake_form_title(inputs)
	return en_demo_guide_configure_intake_form_title(inputs)
});