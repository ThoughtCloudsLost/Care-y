/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_View_Reports_HintInputs */

const en_permission_view_reports_hint = /** @type {(inputs: Permission_View_Reports_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Also opens the call history, which covers every call the organization handled across all queues.`)
};

const es_permission_view_reports_hint = /** @type {(inputs: Permission_View_Reports_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`También abre el historial de llamadas, que incluye todas las llamadas que atendió la organización en todas las colas.`)
};

const en_xa2_permission_view_reports_hint = /** @type {(inputs: Permission_View_Reports_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àlsò òpèns thè càll hìstòry, whìch còvèrs èvèry càll thè òrgànìzàtìòn hàndlèd àcròss àll qùèùès. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Also opens the call history, which covers every call the organization handled across all queues." |
*
* @param {Permission_View_Reports_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_reports_hint = /** @type {((inputs?: Permission_View_Reports_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_View_Reports_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_view_reports_hint(inputs)
	if (locale === "en-XA") return en_xa2_permission_view_reports_hint(inputs)
	return en_permission_view_reports_hint(inputs)
});