/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Retention_BodyInputs */

const en_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Automatic deletion accepts a window of 1 to 3,650 days, and both enabling and changing the value ask for confirmation. The confirmation states that deleted data cannot be recovered even with the escrow file.
**Scope.** The retention policy applies to tickets, messages, and caller personal information older than the cutoff, and it is set once for the whole organization rather than per queue or per ticket type. Audit entries are exempt from this policy.
**Permissions.** Configuring the retention policy requires the Manage retention permission.`)
};

const es_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La eliminación automática acepta una ventana de 1 a 3.650 días, y tanto habilitarla como cambiar el valor piden confirmación. La confirmación indica que los datos eliminados no se pueden recuperar ni siquiera con el archivo de custodia.
**Alcance.** La política de retención se aplica a tickets, mensajes e información personal de personas que llaman con una antigüedad mayor al límite, y se establece una sola vez para toda la organización en lugar de por cola o por tipo de ticket. Las entradas de auditoría están exentas de esta política.
**Permisos.** Configurar la política de retención requiere el permiso Definir cuánto tiempo se conservan los datos personales.`)
};

const en_xa2_demo_narrative_admin_retention_body = /** @type {(inputs: Demo_Narrative_Admin_Retention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùtòmàtìc dèlètìòn àccèpts à wìndòw òf 1 tò 3,650 dàys, ànd bòth ènàblìng ànd chàngìng thè vàlùè àsk fòr cònfìrmàtìòn. Thè cònfìrmàtìòn stàtès thàt dèlètèd dàtà cànnòt bè rècòvèrèd èvèn wìth thè èscròw fìlè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Scòpè. ••** Thè rètèntìòn pòlìcy àpplìès tò tìckèts, mèssàgès, ànd càllèr pèrsònàl ìnfòrmàtìòn òldèr thàn thè cùtòff, ànd ìt ìs sèt òncè fòr thè whòlè òrgànìzàtìòn ràthèr thàn pèr qùèùè òr pèr tìckèt typè. Àùdìt èntrìès àrè èxèmpt fròm thìs pòlìcy.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Cònfìgùrìng thè rètèntìòn pòlìcy rèqùìrès thè Mànàgè rètèntìòn pèrmìssìòn. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Automatic deletion accepts a window of 1 to 3,650 days, and both enabling and changing the value ask for confirmation. The confirmation states that deleted d..." |
*
* @param {Demo_Narrative_Admin_Retention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_retention_body = /** @type {((inputs?: Demo_Narrative_Admin_Retention_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Retention_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_retention_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_retention_body(inputs)
	return en_demo_narrative_admin_retention_body(inputs)
});