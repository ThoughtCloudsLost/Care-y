/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Logs_DescInputs */

const en_demo_section_admin_logs_desc = /** @type {(inputs: Demo_Section_Admin_Logs_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The logs page combines call history and audit events behind two tabs. The call tab lists telephony entries already stored on tickets, and the audit tab records administrative actions across the organization. Both tabs have their own filter pills for narrowing results.`)
};

const es_demo_section_admin_logs_desc = /** @type {(inputs: Demo_Section_Admin_Logs_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de registros combina el historial de llamadas y los eventos de auditoría detrás de dos pestañas. La pestaña de llamadas lista las entradas de telefonía ya almacenadas en los tickets, y la pestaña de auditoría registra acciones administrativas en toda la organización. Ambas pestañas tienen sus propias pastillas de filtro para acotar resultados.`)
};

/**
* | output |
* | --- |
* | "The logs page combines call history and audit events behind two tabs. The call tab lists telephony entries already stored on tickets, and the audit tab recor..." |
*
* @param {Demo_Section_Admin_Logs_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_logs_desc = /** @type {((inputs?: Demo_Section_Admin_Logs_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Logs_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_logs_desc(inputs)
	return en_demo_section_admin_logs_desc(inputs)
});