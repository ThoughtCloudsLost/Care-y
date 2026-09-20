/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Volunteers_WhatInputs */

const en_intake_protected_volunteers_what = /** @type {(inputs: Intake_Protected_Volunteers_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Until a volunteer first opens your case, the organization can unlock what you wrote. From then on, only the volunteers working on your case can read it.`)
};

const es_intake_protected_volunteers_what = /** @type {(inputs: Intake_Protected_Volunteers_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hasta que un voluntario abra tu caso por primera vez, la organización puede acceder a lo que escribiste. A partir de entonces, solo los voluntarios que trabajan en tu caso pueden leerlo.`)
};

/**
* | output |
* | --- |
* | "Until a volunteer first opens your case, the organization can unlock what you wrote. From then on, only the volunteers working on your case can read it." |
*
* @param {Intake_Protected_Volunteers_WhatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_volunteers_what = /** @type {((inputs?: Intake_Protected_Volunteers_WhatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Volunteers_WhatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_protected_volunteers_what(inputs)
	return en_intake_protected_volunteers_what(inputs)
});