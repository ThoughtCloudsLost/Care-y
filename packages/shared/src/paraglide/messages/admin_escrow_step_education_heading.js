/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Step_Education_HeadingInputs */

const en_admin_escrow_step_education_heading = /** @type {(inputs: Admin_Escrow_Step_Education_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What is an escrow file?`)
};

const es_admin_escrow_step_education_heading = /** @type {(inputs: Admin_Escrow_Step_Education_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Qué es un archivo de custodia?`)
};

const en_xa2_admin_escrow_step_education_heading = /** @type {(inputs: Admin_Escrow_Step_Education_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whàt ìs àn èscròw fìlè? •••••••⟧`)
};

/**
* | output |
* | --- |
* | "What is an escrow file?" |
*
* @param {Admin_Escrow_Step_Education_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_step_education_heading = /** @type {((inputs?: Admin_Escrow_Step_Education_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Step_Education_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_step_education_heading(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_step_education_heading(inputs)
	return en_admin_escrow_step_education_heading(inputs)
});