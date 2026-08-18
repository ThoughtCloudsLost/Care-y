/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Phone_Lines_BodyInputs */

const en_demo_narrative_admin_phone_lines_body = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each phone line has a number, a purpose role, and associated greetings. Purpose roles like intake and outbound determine how the line is used. The simulator seeds two fictional 555 numbers with purpose roles for demonstration.`)
};

const es_demo_narrative_admin_phone_lines_body = /** @type {(inputs: Demo_Narrative_Admin_Phone_Lines_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada linea telefonica tiene un numero, un rol de proposito y saludos asociados. Los roles de proposito como recepcion y salida determinan como se usa la linea. El simulador configura dos numeros ficticios 555 con roles de proposito para la demostracion.`)
};

/**
* | output |
* | --- |
* | "Each phone line has a number, a purpose role, and associated greetings. Purpose roles like intake and outbound determine how the line is used. The simulator ..." |
*
* @param {Demo_Narrative_Admin_Phone_Lines_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_phone_lines_body = /** @type {((inputs?: Demo_Narrative_Admin_Phone_Lines_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Phone_Lines_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_phone_lines_body(inputs)
	return es_demo_narrative_admin_phone_lines_body(inputs)
});