/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Web_Intake_ToggledInputs */

const en_audit_event_web_intake_toggled = /** @type {(inputs: Audit_Event_Web_Intake_ToggledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Web intake toggled`)
};

const es_audit_event_web_intake_toggled = /** @type {(inputs: Audit_Event_Web_Intake_ToggledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recepcion en linea activada o desactivada`)
};

/**
* | output |
* | --- |
* | "Web intake toggled" |
*
* @param {Audit_Event_Web_Intake_ToggledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_web_intake_toggled = /** @type {((inputs?: Audit_Event_Web_Intake_ToggledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Web_Intake_ToggledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_web_intake_toggled(inputs)
	return es_audit_event_web_intake_toggled(inputs)
});