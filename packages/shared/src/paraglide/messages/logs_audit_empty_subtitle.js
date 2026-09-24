/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Audit_Empty_SubtitleInputs */

const en_logs_audit_empty_subtitle = /** @type {(inputs: Logs_Audit_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`System activity will appear here as changes are made.`)
};

const es_logs_audit_empty_subtitle = /** @type {(inputs: Logs_Audit_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La actividad del sistema aparecerá aquí a medida que se realicen cambios.`)
};

const en_xa2_logs_audit_empty_subtitle = /** @type {(inputs: Logs_Audit_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Systèm àctìvìty wìll àppèàr hèrè às chàngès àrè màdè. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "System activity will appear here as changes are made." |
*
* @param {Logs_Audit_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_audit_empty_subtitle = /** @type {((inputs?: Logs_Audit_Empty_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Audit_Empty_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_audit_empty_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_logs_audit_empty_subtitle(inputs)
	return en_logs_audit_empty_subtitle(inputs)
});