/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, tickets: NonNullable<unknown> }} Admin_Reports_Volume_AriaInputs */

const en_admin_reports_volume_aria = /** @type {(inputs: Admin_Reports_Volume_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Monthly ${i?.ticket} volume over the last 12 months`)
};

const es_admin_reports_volume_aria = /** @type {(inputs: Admin_Reports_Volume_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Volumen mensual de ${i?.tickets} en los ultimos 12 meses`)
};

const en_xa2_admin_reports_volume_aria = /** @type {(inputs: Admin_Reports_Volume_AriaInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Mònthly  •••${i?.ticket} vòlùmè òvèr thè làst 12 mònths ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Monthly {ticket} volume over the last 12 months" |
*
* @param {Admin_Reports_Volume_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_volume_aria = /** @type {((inputs: Admin_Reports_Volume_AriaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reports_Volume_AriaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reports_volume_aria(inputs)
	if (locale === "en-XA") return en_xa2_admin_reports_volume_aria(inputs)
	return en_admin_reports_volume_aria(inputs)
});