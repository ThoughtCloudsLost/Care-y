/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ permission: NonNullable<unknown>, role: NonNullable<unknown> }} Roles_Toggle_AriaInputs */

const en_roles_toggle_aria = /** @type {(inputs: Roles_Toggle_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.permission} for ${i?.role}`)
};

const es_roles_toggle_aria = /** @type {(inputs: Roles_Toggle_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.permission} para ${i?.role}`)
};

const en_xa2_roles_toggle_aria = /** @type {(inputs: Roles_Toggle_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.permission} fòr  ••${i?.role}⟧`)
};

/**
* | output |
* | --- |
* | "{permission} for {role}" |
*
* @param {Roles_Toggle_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_toggle_aria = /** @type {((inputs: Roles_Toggle_AriaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Toggle_AriaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_toggle_aria(inputs)
	if (locale === "en-XA") return en_xa2_roles_toggle_aria(inputs)
	return en_roles_toggle_aria(inputs)
});