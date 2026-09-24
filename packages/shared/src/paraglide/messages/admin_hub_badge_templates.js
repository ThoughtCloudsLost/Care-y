/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Hub_Badge_TemplatesInputs */

const en_admin_hub_badge_templates = /** @type {(inputs: Admin_Hub_Badge_TemplatesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} templates`)
};

const es_admin_hub_badge_templates = /** @type {(inputs: Admin_Hub_Badge_TemplatesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} plantillas`)
};

const en_xa2_admin_hub_badge_templates = /** @type {(inputs: Admin_Hub_Badge_TemplatesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} tèmplàtès •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} templates" |
*
* @param {Admin_Hub_Badge_TemplatesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_templates = /** @type {((inputs: Admin_Hub_Badge_TemplatesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_TemplatesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_hub_badge_templates(inputs)
	if (locale === "en-XA") return en_xa2_admin_hub_badge_templates(inputs)
	return en_admin_hub_badge_templates(inputs)
});