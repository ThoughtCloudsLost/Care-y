/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Client_Intake_Arc_Step4Inputs */

const en_demo_guide_client_intake_arc_step4 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap Send encrypted message. A reference code appears on success.`)
};

const es_demo_guide_client_intake_arc_step4 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca Enviar mensaje cifrado. Un código de referencia aparece si el envío es exitoso.`)
};

const en_xa2_demo_guide_client_intake_arc_step4 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp Sènd èncryptèd mèssàgè. À rèfèrèncè còdè àppèàrs òn sùccèss. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap Send encrypted message. A reference code appears on success." |
*
* @param {Demo_Guide_Client_Intake_Arc_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_intake_arc_step4 = /** @type {((inputs?: Demo_Guide_Client_Intake_Arc_Step4Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Client_Intake_Arc_Step4Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_client_intake_arc_step4(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_client_intake_arc_step4(inputs)
	return en_demo_guide_client_intake_arc_step4(inputs)
});