/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Manager_TooltipInputs */

const en_demo_role_manager_tooltip = /** @type {(inputs: Demo_Role_Manager_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manager with access to volunteers, queues, and reports. Cannot change org settings or infrastructure.`)
};

const es_demo_role_manager_tooltip = /** @type {(inputs: Demo_Role_Manager_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Responsable con acceso a voluntarios, colas e informes. No puede cambiar la configuración de la organización ni la infraestructura.`)
};

const en_xa2_demo_role_manager_tooltip = /** @type {(inputs: Demo_Role_Manager_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgèr wìth àccèss tò vòlùntèèrs, qùèùès, ànd rèpòrts. Cànnòt chàngè òrg sèttìngs òr ìnfràstrùctùrè. •••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manager with access to volunteers, queues, and reports. Cannot change org settings or infrastructure." |
*
* @param {Demo_Role_Manager_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_manager_tooltip = /** @type {((inputs?: Demo_Role_Manager_TooltipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Manager_TooltipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_role_manager_tooltip(inputs)
	if (locale === "en-XA") return en_xa2_demo_role_manager_tooltip(inputs)
	return en_demo_role_manager_tooltip(inputs)
});