/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Comms_DescInputs */

const en_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`These entries configure the external channels the organization uses to communicate with clients, and the channel policy entry determines which of those channels are available on any given ticket.`)
};

const es_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estas entradas configuran los canales externos que la organización usa para comunicarse con los clientes, y la entrada de política de canales determina cuáles de esos canales están disponibles en cada ticket.`)
};

const en_xa2_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thèsè èntrìès cònfìgùrè thè èxtèrnàl chànnèls thè òrgànìzàtìòn ùsès tò còmmùnìcàtè wìth clìènts, ànd thè chànnèl pòlìcy èntry dètèrmìnès whìch òf thòsè chànnèls àrè àvàìlàblè òn àny gìvèn tìckèt. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "These entries configure the external channels the organization uses to communicate with clients, and the channel policy entry determines which of those chann..." |
*
* @param {Demo_Section_Admin_Comms_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_comms_desc = /** @type {((inputs?: Demo_Section_Admin_Comms_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Comms_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_comms_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_comms_desc(inputs)
	return en_demo_section_admin_comms_desc(inputs)
});