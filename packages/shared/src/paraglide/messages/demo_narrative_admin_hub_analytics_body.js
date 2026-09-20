/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_Analytics_BodyInputs */

const en_demo_narrative_admin_hub_analytics_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Analytics_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Impact reports, operational metrics, deep analysis, the call log, and the audit log. The analytics group is in development.`)
};

const es_demo_narrative_admin_hub_analytics_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Analytics_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Informes de impacto, métricas operativas, análisis profundo, el registro de llamadas y el registro de auditoría. El grupo de analíticas está en desarrollo.`)
};

const en_xa2_demo_narrative_admin_hub_analytics_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Analytics_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìmpàct rèpòrts, òpèràtìònàl mètrìcs, dèèp ànàlysìs, thè càll lòg, ànd thè àùdìt lòg. Thè ànàlytìcs gròùp ìs ìn dèvèlòpmènt. •••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Impact reports, operational metrics, deep analysis, the call log, and the audit log. The analytics group is in development." |
*
* @param {Demo_Narrative_Admin_Hub_Analytics_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_analytics_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_Analytics_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_Analytics_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_analytics_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_analytics_body(inputs)
	return en_demo_narrative_admin_hub_analytics_body(inputs)
});