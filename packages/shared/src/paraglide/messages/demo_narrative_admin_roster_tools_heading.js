/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Roster_Tools_HeadingInputs */

const en_demo_narrative_admin_roster_tools_heading = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Roster tools`)
};

const es_demo_narrative_admin_roster_tools_heading = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Herramientas del directorio`)
};

const en_xa2_demo_narrative_admin_roster_tools_heading = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròstèr tòòls ••••⟧`)
};

/**
* | output |
* | --- |
* | "Roster tools" |
*
* @param {Demo_Narrative_Admin_Roster_Tools_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roster_tools_heading = /** @type {((inputs?: Demo_Narrative_Admin_Roster_Tools_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Roster_Tools_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_roster_tools_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_roster_tools_heading(inputs)
	return en_demo_narrative_admin_roster_tools_heading(inputs)
});