/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Record_A_Disbursement_TitleInputs */

const en_demo_guide_record_a_disbursement_title = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Record a disbursement`)
};

const es_demo_guide_record_a_disbursement_title = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registrar un desembolso`)
};

const en_xa2_demo_guide_record_a_disbursement_title = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòrd à dìsbùrsèmènt •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Record a disbursement" |
*
* @param {Demo_Guide_Record_A_Disbursement_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_record_a_disbursement_title = /** @type {((inputs?: Demo_Guide_Record_A_Disbursement_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Record_A_Disbursement_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_record_a_disbursement_title(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_record_a_disbursement_title(inputs)
	return en_demo_guide_record_a_disbursement_title(inputs)
});