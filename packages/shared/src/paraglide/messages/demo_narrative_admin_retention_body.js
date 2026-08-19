/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Retention_BodyInputs */

const en_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrators configure how long different types of data are retained before automatic deletion. Retention rules apply to closed tickets, voicemails, and other time sensitive data.
**Configuration.** A toggle enables automatic deletion and a days field sets the window. Enabling, changing, or clearing the policy asks for confirmation before it takes effect. The simulator seeds a 365 day policy so the active state is visible.`)
};

const es_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los administradores configuran cuanto tiempo se retienen los diferentes tipos de datos antes de su eliminacion automatica. Las reglas de retencion se aplican a tickets cerrados, mensajes de voz y otros datos con plazo.
**Configuracion.** Un interruptor habilita la eliminacion automatica y un campo de dias establece la ventana. Habilitar, cambiar o borrar la politica pide confirmacion antes de que surta efecto. El simulador preestablece una politica de 365 dias para que el estado activo sea visible.`)
};

/**
* | output |
* | --- |
* | "Administrators configure how long different types of data are retained before automatic deletion. Retention rules apply to closed tickets, voicemails, and ot..." |
*
* @param {Demo_Narrative_Admin_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_retention_body = /** @type {((inputs?: Demo_Narrative_Admin_Retention_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Retention_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_retention_body(inputs)
	return es_demo_narrative_admin_retention_body(inputs)
});