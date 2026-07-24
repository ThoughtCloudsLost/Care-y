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

/**
* | output |
* | --- |
* | "Your role: {role}" |
*
* @param {Sidebar_Role_Badge_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const sidebar_role_badge_label = /** @type {((inputs: Sidebar_Role_Badge_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Sidebar_Role_Badge_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_sidebar_role_badge_label(inputs)
	return es_sidebar_role_badge_label(inputs)
});