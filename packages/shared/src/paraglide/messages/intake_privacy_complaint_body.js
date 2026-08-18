/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Complaint_BodyInputs */

const en_intake_privacy_complaint_body = /** @type {(inputs: Intake_Privacy_Complaint_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If you believe your data has been handled incorrectly, you have the right to lodge a complaint with a data protection supervisory authority in your country.`)
};

const es_intake_privacy_complaint_body = /** @type {(inputs: Intake_Privacy_Complaint_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si crees que tus datos han sido manejados incorrectamente, tienes derecho a presentar una queja ante una autoridad de proteccion de datos en tu pais.`)
};

/**
* | output |
* | --- |
* | "If you believe your data has been handled incorrectly, you have the right to lodge a complaint with a data protection supervisory authority in your country." |
*
* @param {Intake_Privacy_Complaint_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_complaint_body = /** @type {((inputs?: Intake_Privacy_Complaint_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Complaint_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_complaint_body(inputs)
	return es_intake_privacy_complaint_body(inputs)
});