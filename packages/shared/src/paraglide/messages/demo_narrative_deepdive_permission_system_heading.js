/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Permission_System_HeadingInputs */

const en_demo_narrative_deepdive_permission_system_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Permission_System_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The permission system`)
};

const es_demo_narrative_deepdive_permission_system_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Permission_System_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El sistema de permisos`)
};

/**
* | output |
* | --- |
* | "The permission system" |
*
* @param {Demo_Narrative_Deepdive_Permission_System_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_permission_system_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_Permission_System_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Permission_System_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_permission_system_heading(inputs)
	return en_demo_narrative_deepdive_permission_system_heading(inputs)
});