/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Manager_TooltipInputs */

const en_demo_role_manager_tooltip = /** @type {(inputs: Demo_Role_Manager_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manager user: can manage volunteers, queues, and reports, but cannot change org settings or infrastructure.`)
};

const es_demo_role_manager_tooltip = /** @type {(inputs: Demo_Role_Manager_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario responsable: puede gestionar voluntarios, colas e informes, pero no puede cambiar la configuracion de la organizacion ni la infraestructura.`)
};

/**
* | output |
* | --- |
* | "Manager user: can manage volunteers, queues, and reports, but cannot change org settings or infrastructure." |
*
* @param {Demo_Role_Manager_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_manager_tooltip = /** @type {((inputs?: Demo_Role_Manager_TooltipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Manager_TooltipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_role_manager_tooltip(inputs)
	return es_demo_role_manager_tooltip(inputs)
});