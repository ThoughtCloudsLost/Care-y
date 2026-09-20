/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ role: NonNullable<unknown> }} Sidebar_Role_Badge_LabelInputs */

const en_sidebar_role_badge_label = /** @type {(inputs: Sidebar_Role_Badge_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Your role: ${i?.role}`)
};

const es_sidebar_role_badge_label = /** @type {(inputs: Sidebar_Role_Badge_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tu rol: ${i?.role}`)
};

const en_xa2_sidebar_role_badge_label = /** @type {(inputs: Sidebar_Role_Badge_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Yòùr ròlè:  ••••${i?.role}⟧`)
};

/**
* | output |
* | --- |
* | "Your role: {role}" |
*
* @param {Sidebar_Role_Badge_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const sidebar_role_badge_label = /** @type {((inputs: Sidebar_Role_Badge_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Sidebar_Role_Badge_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_sidebar_role_badge_label(inputs)
	if (locale === "en-XA") return en_xa2_sidebar_role_badge_label(inputs)
	return en_sidebar_role_badge_label(inputs)
});