/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Merge_UndoneInputs */

const en_audit_event_merge_undone = /** @type {(inputs: Audit_Event_Merge_UndoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Merge undone`)
};

const es_audit_event_merge_undone = /** @type {(inputs: Audit_Event_Merge_UndoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fusion deshecha`)
};

/**
* | output |
* | --- |
* | "Merge undone" |
*
* @param {Audit_Event_Merge_UndoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_merge_undone = /** @type {((inputs?: Audit_Event_Merge_UndoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Merge_UndoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_audit_event_merge_undone(inputs)
	return es_audit_event_merge_undone(inputs)
});