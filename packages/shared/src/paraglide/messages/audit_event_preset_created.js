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

const en_xa2_audit_event_preset_created = /** @type {(inputs: Audit_Event_Preset_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prèsèt crèàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Preset created" |
*
* @param {Audit_Event_Preset_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_preset_created = /** @type {((inputs?: Audit_Event_Preset_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Preset_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_preset_created(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_preset_created(inputs)
	return en_audit_event_preset_created(inputs)
});