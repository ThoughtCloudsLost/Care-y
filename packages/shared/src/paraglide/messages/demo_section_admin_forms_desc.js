/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Forms_DescInputs */

const en_demo_section_admin_forms_desc = /** @type {(inputs: Demo_Section_Admin_Forms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Custom intake forms let organizations collect the information their workflow needs. Each form feeds a destination queue so tickets land in the right place automatically, each gets its own shareable link, and a closing date can stop submissions on a schedule.`)
};

const es_demo_section_admin_forms_desc = /** @type {(inputs: Demo_Section_Admin_Forms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los formularios de admisión personalizados permiten a las organizaciones recopilar la información que su flujo de trabajo necesita. Cada formulario alimenta una cola de destino para que los tickets lleguen al lugar correcto automáticamente, cada uno tiene su propio enlace para compartir, y una fecha de cierre puede detener los envíos de forma programada.`)
};

/**
* | output |
* | --- |
* | "Custom intake forms let organizations collect the information their workflow needs. Each form feeds a destination queue so tickets land in the right place au..." |
*
* @param {Demo_Section_Admin_Forms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_forms_desc = /** @type {((inputs?: Demo_Section_Admin_Forms_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Forms_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_forms_desc(inputs)
	return en_demo_section_admin_forms_desc(inputs)
});