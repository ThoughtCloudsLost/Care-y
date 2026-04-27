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

/**
* | output |
* | --- |
* | "{count} templates" |
*
* @param {Admin_Hub_Badge_TemplatesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_templates = /** @type {((inputs: Admin_Hub_Badge_TemplatesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_TemplatesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_templates(inputs)
	return es_admin_hub_badge_templates(inputs)
});