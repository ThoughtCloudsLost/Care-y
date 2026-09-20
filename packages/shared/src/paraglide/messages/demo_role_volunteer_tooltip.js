/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Role_Volunteer_TooltipInputs */

const en_demo_role_volunteer_tooltip = /** @type {(inputs: Demo_Role_Volunteer_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer with access to their own tickets. Admin only screens are blocked by real server middleware.`)
};

const es_demo_role_volunteer_tooltip = /** @type {(inputs: Demo_Role_Volunteer_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voluntario con acceso a sus propios tickets. Las pantallas de administración están bloqueadas por el middleware real del servidor.`)
};

const en_xa2_demo_role_volunteer_tooltip = /** @type {(inputs: Demo_Role_Volunteer_TooltipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèr wìth àccèss tò thèìr òwn tìckèts. Àdmìn ònly scrèèns àrè blòckèd by rèàl sèrvèr mìddlèwàrè. •••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Volunteer with access to their own tickets. Admin only screens are blocked by real server middleware." |
*
* @param {Demo_Role_Volunteer_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_role_volunteer_tooltip = /** @type {((inputs?: Demo_Role_Volunteer_TooltipInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Role_Volunteer_TooltipInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_role_volunteer_tooltip(inputs)
	if (locale === "en-XA") return en_xa2_demo_role_volunteer_tooltip(inputs)
	return en_demo_role_volunteer_tooltip(inputs)
});