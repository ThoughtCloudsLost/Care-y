/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Record_A_Disbursement_Step4Inputs */

const en_demo_guide_record_a_disbursement_step4 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the fund ledger from the admin hub. The new entry appears in the fund's history.`)
};

const es_demo_guide_record_a_disbursement_step4 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el registro de fondos desde el panel de administración. La nueva entrada aparece en el historial del fondo.`)
};

const en_xa2_demo_guide_record_a_disbursement_step4 = /** @type {(inputs: Demo_Guide_Record_A_Disbursement_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè fùnd lèdgèr fròm thè àdmìn hùb. Thè nèw èntry àppèàrs ìn thè fùnd's hìstòry. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the fund ledger from the admin hub. The new entry appears in the fund's history." |
*
* @param {Demo_Guide_Record_A_Disbursement_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_record_a_disbursement_step4 = /** @type {((inputs?: Demo_Guide_Record_A_Disbursement_Step4Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Record_A_Disbursement_Step4Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_record_a_disbursement_step4(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_record_a_disbursement_step4(inputs)
	return en_demo_guide_record_a_disbursement_step4(inputs)
});