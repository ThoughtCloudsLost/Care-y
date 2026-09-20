/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Complaint_TitleInputs */

const en_intake_privacy_complaint_title = /** @type {(inputs: Intake_Privacy_Complaint_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Right to complain`)
};

const es_intake_privacy_complaint_title = /** @type {(inputs: Intake_Privacy_Complaint_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Derecho a reclamar`)
};

const en_xa2_intake_privacy_complaint_title = /** @type {(inputs: Intake_Privacy_Complaint_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rìght tò còmplàìn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Right to complain" |
*
* @param {Intake_Privacy_Complaint_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_complaint_title = /** @type {((inputs?: Intake_Privacy_Complaint_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Complaint_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_complaint_title(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_complaint_title(inputs)
	return en_intake_privacy_complaint_title(inputs)
});