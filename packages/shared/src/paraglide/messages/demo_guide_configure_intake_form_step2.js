/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Configure_Intake_Form_Step2Inputs */

const en_demo_guide_configure_intake_form_step2 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create or edit a form. Add fields and reorder them in the editor.`)
};

const es_demo_guide_configure_intake_form_step2 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crea o edita un formulario. Agrega campos y reordénalos en el editor.`)
};

const en_xa2_demo_guide_configure_intake_form_step2 = /** @type {(inputs: Demo_Guide_Configure_Intake_Form_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè òr èdìt à fòrm. Àdd fìèlds ànd rèòrdèr thèm ìn thè èdìtòr. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Create or edit a form. Add fields and reorder them in the editor." |
*
* @param {Demo_Guide_Configure_Intake_Form_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_configure_intake_form_step2 = /** @type {((inputs?: Demo_Guide_Configure_Intake_Form_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Configure_Intake_Form_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_configure_intake_form_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_configure_intake_form_step2(inputs)
	return en_demo_guide_configure_intake_form_step2(inputs)
});