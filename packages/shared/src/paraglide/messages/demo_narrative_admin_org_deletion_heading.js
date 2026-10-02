/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Org_Deletion_HeadingInputs */

const en_demo_narrative_admin_org_deletion_heading = /** @type {(inputs: Demo_Narrative_Admin_Org_Deletion_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete organization`)
};

const es_demo_narrative_admin_org_deletion_heading = /** @type {(inputs: Demo_Narrative_Admin_Org_Deletion_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar organización`)
};

const en_xa2_demo_narrative_admin_org_deletion_heading = /** @type {(inputs: Demo_Narrative_Admin_Org_Deletion_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè òrgànìzàtìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete organization" |
*
* @param {Demo_Narrative_Admin_Org_Deletion_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_org_deletion_heading = /** @type {((inputs?: Demo_Narrative_Admin_Org_Deletion_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Org_Deletion_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_org_deletion_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_org_deletion_heading(inputs)
	return en_demo_narrative_admin_org_deletion_heading(inputs)
});