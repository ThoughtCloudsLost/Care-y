/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ permission: NonNullable<unknown>, role: NonNullable<unknown> }} Roles_Locked_Toggle_AriaInputs */

const en_roles_locked_toggle_aria = /** @type {(inputs: Roles_Locked_Toggle_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.permission} for ${i?.role}, locked to Admin`)
};

const es_roles_locked_toggle_aria = /** @type {(inputs: Roles_Locked_Toggle_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.permission} para ${i?.role}, reservado para Admin`)
};

const en_xa2_roles_locked_toggle_aria = /** @type {(inputs: Roles_Locked_Toggle_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.permission} fòr  ••${i?.role}, lòckèd tò Àdmìn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "{permission} for {role}, locked to Admin" |
*
* @param {Roles_Locked_Toggle_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_locked_toggle_aria = /** @type {((inputs: Roles_Locked_Toggle_AriaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Locked_Toggle_AriaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_locked_toggle_aria(inputs)
	if (locale === "en-XA") return en_xa2_roles_locked_toggle_aria(inputs)
	return en_roles_locked_toggle_aria(inputs)
});