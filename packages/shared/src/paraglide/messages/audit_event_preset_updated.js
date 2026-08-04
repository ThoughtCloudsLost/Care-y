/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Preset_UpdatedInputs */

const en_audit_event_preset_updated = /** @type {(inputs: Audit_Event_Preset_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preset updated`)
};

const es_audit_event_preset_updated = /** @type {(inputs: Audit_Event_Preset_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta predefinida actualizada`)
};

/**
* | output |
* | --- |
* | "Preset updated" |
*
* @param {Audit_Event_Preset_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_preset_updated = /** @type {((inputs?: Audit_Event_Preset_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Preset_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_preset_updated(inputs)
	return es_audit_event_preset_updated(inputs)
});