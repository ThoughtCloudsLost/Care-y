/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Roles_BodyInputs */

const en_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A reference page for each role describes what managers and volunteers can see and do.
**Contents.** Each page summarizes the role's permissions, the queues it can work, its operational statistics, which protected fields stay hidden from it, and links onward to reports and security status.
**Why it matters.** The role pages are the quickest way to answer what a volunteer's account could expose if it were compromised, because the encryption boundaries are described per role.`)
};

const es_demo_narrative_admin_roles_body = /** @type {(inputs: Demo_Narrative_Admin_Roles_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una página de referencia para cada rol describe lo que los gestores y voluntarios pueden ver y hacer.
**Contenido.** Cada página resume los permisos del rol, las colas en las que puede trabajar, sus estadísticas operativas, qué campos protegidos permanecen ocultos para el, y enlaces a informes y estado de seguridad.
**Por qué importa.** Las páginas de roles son la forma más rápida de responder qué podría exponer la cuenta de un voluntario si fuera comprometida, porque los límites del cifrado se describen por rol.`)
};

/**
* | output |
* | --- |
* | "A reference page for each role describes what managers and volunteers can see and do. **Contents.** Each page summarizes the role's permissions, the queues i..." |
*
* @param {Demo_Narrative_Admin_Roles_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roles_body = /** @type {((inputs?: Demo_Narrative_Admin_Roles_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Roles_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_roles_body(inputs)
	return es_demo_narrative_admin_roles_body(inputs)
});