/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Audit_Log_SubtitleInputs */

const en_hub_audit_log_subtitle = /** @type {(inputs: Hub_Audit_Log_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Review system activity and change history`)
};

const es_hub_audit_log_subtitle = /** @type {(inputs: Hub_Audit_Log_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revisar la actividad del sistema y el historial de cambios`)
};

const en_xa2_hub_audit_log_subtitle = /** @type {(inputs: Hub_Audit_Log_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèvìèw systèm àctìvìty ànd chàngè hìstòry •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Review system activity and change history" |
*
* @param {Hub_Audit_Log_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_audit_log_subtitle = /** @type {((inputs?: Hub_Audit_Log_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Audit_Log_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_audit_log_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_audit_log_subtitle(inputs)
	return en_hub_audit_log_subtitle(inputs)
});