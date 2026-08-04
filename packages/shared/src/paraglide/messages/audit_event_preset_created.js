/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Preset_CreatedInputs */

const en_audit_event_preset_created = /** @type {(inputs: Audit_Event_Preset_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preset created`)
};

const es_audit_event_preset_created = /** @type {(inputs: Audit_Event_Preset_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta predefinida creada`)
};

/**
* | output |
* | --- |
* | "Preset created" |
*
* @param {Audit_Event_Preset_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_preset_created = /** @type {((inputs?: Audit_Event_Preset_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Preset_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_preset_created(inputs)
	return es_audit_event_preset_created(inputs)
});