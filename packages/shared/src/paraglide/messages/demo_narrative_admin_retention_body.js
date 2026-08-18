/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Retention_BodyInputs */

const en_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrators configure how long different types of data are retained before automatic deletion. Retention rules apply to closed tickets, voicemails, and other time sensitive data.`)
};

const es_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los administradores configuran cuanto tiempo se retienen los diferentes tipos de datos antes de su eliminacion automatica. Las reglas de retencion se aplican a tickets cerrados, mensajes de voz y otros datos con plazo.`)
};

/**
* | output |
* | --- |
* | "Administrators configure how long different types of data are retained before automatic deletion. Retention rules apply to closed tickets, voicemails, and ot..." |
*
* @param {Demo_Narrative_Admin_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_retention_body = /** @type {((inputs?: Demo_Narrative_Admin_Retention_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Retention_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_retention_body(inputs)
	return es_demo_narrative_admin_retention_body(inputs)
});