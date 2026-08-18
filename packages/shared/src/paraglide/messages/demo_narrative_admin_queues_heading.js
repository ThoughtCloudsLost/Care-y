/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Queues_HeadingInputs */

const en_demo_narrative_admin_queues_heading = /** @type {(inputs: Demo_Narrative_Admin_Queues_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue management`)
};

const es_demo_narrative_admin_queues_heading = /** @type {(inputs: Demo_Narrative_Admin_Queues_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestion de colas`)
};

/**
* | output |
* | --- |
* | "Queue management" |
*
* @param {Demo_Narrative_Admin_Queues_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_queues_heading = /** @type {((inputs?: Demo_Narrative_Admin_Queues_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Queues_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_queues_heading(inputs)
	return es_demo_narrative_admin_queues_heading(inputs)
});