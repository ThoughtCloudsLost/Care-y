/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Audit_Empty_SubtitleInputs */

const en_logs_audit_empty_subtitle = /** @type {(inputs: Logs_Audit_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`System activity will appear here as changes are made.`)
};

const es_logs_audit_empty_subtitle = /** @type {(inputs: Logs_Audit_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La actividad del sistema aparecera aqui a medida que se realicen cambios.`)
};

/**
* | output |
* | --- |
* | "System activity will appear here as changes are made." |
*
* @param {Logs_Audit_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_audit_empty_subtitle = /** @type {((inputs?: Logs_Audit_Empty_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Audit_Empty_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_audit_empty_subtitle(inputs)
	return es_logs_audit_empty_subtitle(inputs)
});