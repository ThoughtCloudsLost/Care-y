/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Client_Intake_Arc_Step2Inputs */

const en_demo_guide_client_intake_arc_step2 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fill in the form fields. Custom fields added by the organization appear alongside the defaults.`)
};

const es_demo_guide_client_intake_arc_step2 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Completa los campos del formulario. Los campos personalizados que haya agregado la organización aparecen junto a los predeterminados.`)
};

const en_xa2_demo_guide_client_intake_arc_step2 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìll ìn thè fòrm fìèlds. Cùstòm fìèlds àddèd by thè òrgànìzàtìòn àppèàr àlòngsìdè thè dèfàùlts. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Fill in the form fields. Custom fields added by the organization appear alongside the defaults." |
*
* @param {Demo_Guide_Client_Intake_Arc_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_intake_arc_step2 = /** @type {((inputs?: Demo_Guide_Client_Intake_Arc_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Client_Intake_Arc_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_client_intake_arc_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_client_intake_arc_step2(inputs)
	return en_demo_guide_client_intake_arc_step2(inputs)
});