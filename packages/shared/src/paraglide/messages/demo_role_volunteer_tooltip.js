/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Volunteer_TooltipInputs */

const en_demo_role_volunteer_tooltip = /** @type {(inputs: Demo_Role_Volunteer_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer user: can view and manage their own tickets. Admin-only screens are blocked by real server middleware.`)
};

const es_demo_role_volunteer_tooltip = /** @type {(inputs: Demo_Role_Volunteer_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario voluntario: puede ver y gestionar sus propios casos. Las pantallas de administracion estan bloqueadas por el middleware real del servidor.`)
};

/**
* | output |
* | --- |
* | "Volunteer user: can view and manage their own tickets. Admin-only screens are blocked by real server middleware." |
*
* @param {Demo_Role_Volunteer_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_volunteer_tooltip = /** @type {((inputs?: Demo_Role_Volunteer_TooltipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Volunteer_TooltipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_role_volunteer_tooltip(inputs)
	return es_demo_role_volunteer_tooltip(inputs)
});