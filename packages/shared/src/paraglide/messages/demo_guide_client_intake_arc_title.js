/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Client_Intake_Arc_TitleInputs */

const en_demo_guide_client_intake_arc_title = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Submit a request for help`)
};

const es_demo_guide_client_intake_arc_title = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar una solicitud de ayuda`)
};

const en_xa2_demo_guide_client_intake_arc_title = /** @type {(inputs: Demo_Guide_Client_Intake_Arc_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sùbmìt à rèqùèst fòr hèlp ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Submit a request for help" |
*
* @param {Demo_Guide_Client_Intake_Arc_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_client_intake_arc_title = /** @type {((inputs?: Demo_Guide_Client_Intake_Arc_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Client_Intake_Arc_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_client_intake_arc_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_client_intake_arc_title(inputs)
	return en_demo_guide_client_intake_arc_title(inputs)
});