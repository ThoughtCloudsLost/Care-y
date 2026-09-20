/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Intake_Forms_HeadingInputs */

const en_demo_narrative_admin_intake_forms_heading = /** @type {(inputs: Demo_Narrative_Admin_Intake_Forms_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Intake forms list`)
};

const es_demo_narrative_admin_intake_forms_heading = /** @type {(inputs: Demo_Narrative_Admin_Intake_Forms_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista de formularios de admisión`)
};

const en_xa2_demo_narrative_admin_intake_forms_heading = /** @type {(inputs: Demo_Narrative_Admin_Intake_Forms_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntàkè fòrms lìst ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Intake forms list" |
*
* @param {Demo_Narrative_Admin_Intake_Forms_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_intake_forms_heading = /** @type {((inputs?: Demo_Narrative_Admin_Intake_Forms_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Intake_Forms_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_intake_forms_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_intake_forms_heading(inputs)
	return en_demo_narrative_admin_intake_forms_heading(inputs)
});