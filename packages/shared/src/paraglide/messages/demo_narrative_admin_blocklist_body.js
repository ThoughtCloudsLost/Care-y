/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Blocklist_BodyInputs */

const en_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone numbers can be blocked from reaching the organization. Blocked numbers are rejected before a ticket is created.`)
};

const es_demo_narrative_admin_blocklist_body = /** @type {(inputs: Demo_Narrative_Admin_Blocklist_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los numeros de telefono pueden bloquearse para que no lleguen a la organizacion. Los numeros bloqueados se rechazan antes de crear un ticket.`)
};

/**
* | output |
* | --- |
* | "Phone numbers can be blocked from reaching the organization. Blocked numbers are rejected before a ticket is created." |
*
* @param {Demo_Narrative_Admin_Blocklist_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_blocklist_body = /** @type {((inputs?: Demo_Narrative_Admin_Blocklist_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Blocklist_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_blocklist_body(inputs)
	return es_demo_narrative_admin_blocklist_body(inputs)
});