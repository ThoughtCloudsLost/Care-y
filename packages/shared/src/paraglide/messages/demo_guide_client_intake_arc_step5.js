/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Client_Intake_Arc_Step5Inputs */

const en_demo_guide_client_intake_arc_step5 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step5Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the privacy notice from the drawer.`)
};

const es_demo_guide_client_intake_arc_step5 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step5Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el aviso de privacidad desde el menú lateral.`)
};

const en_xa2_demo_guide_client_intake_arc_step5 = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_Step5Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè prìvàcy nòtìcè fròm thè dràwèr. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the privacy notice from the drawer." |
*
* @param {Demo_Guide_Client_Intake_Arc_Step5Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_intake_arc_step5 = /** @type {((inputs?: Demo_Guide_Client_Intake_Arc_Step5Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Client_Intake_Arc_Step5Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_client_intake_arc_step5(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_client_intake_arc_step5(inputs)
	return en_demo_guide_client_intake_arc_step5(inputs)
});