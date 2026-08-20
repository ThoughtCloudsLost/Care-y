/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Clients_HeadingInputs */

const en_demo_narrative_admin_clients_heading = /** @type {(inputs: Demo_Narrative_Admin_Clients_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Client management`)
};

const es_demo_narrative_admin_clients_heading = /** @type {(inputs: Demo_Narrative_Admin_Clients_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestión de clientes`)
};

/**
* | output |
* | --- |
* | "Client management" |
*
* @param {Demo_Narrative_Admin_Clients_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_clients_heading = /** @type {((inputs?: Demo_Narrative_Admin_Clients_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Clients_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_clients_heading(inputs)
	return es_demo_narrative_admin_clients_heading(inputs)
});