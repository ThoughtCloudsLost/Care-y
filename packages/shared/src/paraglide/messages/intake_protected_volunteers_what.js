/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Volunteers_WhatInputs */

const en_intake_protected_volunteers_what = /** @type {(inputs: Intake_Protected_Volunteers_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only volunteers assigned to your case can read your information.`)
};

const es_intake_protected_volunteers_what = /** @type {(inputs: Intake_Protected_Volunteers_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo los voluntarios asignados a tu caso pueden leer tu informacion.`)
};

/**
* | output |
* | --- |
* | "Only volunteers assigned to your case can read your information." |
*
* @param {Intake_Protected_Volunteers_WhatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_volunteers_what = /** @type {((inputs?: Intake_Protected_Volunteers_WhatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Volunteers_WhatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_protected_volunteers_what(inputs)
	return es_intake_protected_volunteers_what(inputs)
});